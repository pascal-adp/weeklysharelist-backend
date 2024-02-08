import { Router } from 'express';
import { randomBytes } from 'crypto';
import querystring from 'querystring';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const router = Router();
const prisma = new PrismaClient();

let oAuthState = "";

router.get("/login", (req, res) => {
    oAuthState = randomBytes(8).toString('hex');
    const scope = "user-top-read";

    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: process.env.CLIENT_ID,
            scope: scope,
            redirect_uri: process.env.URL + "/auth/spotify/callback",
            state: oAuthState
        }));
});

interface SpotifyAuthRessult {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
}

router.get("/callback", async (req, res) => {
    const reqState = req.query.state;

    if (reqState === null) {
        throw new Error("State is null");
    }
    else if (reqState !== oAuthState) {
        throw new Error("State mismatch");
    }
    else {
        const result = await axios.post<SpotifyAuthRessult>('https://accounts.spotify.com/api/token', {
            code: req.query.code,
            redirect_uri: process.env.URL + "/auth/spotify/callback",
            grant_type: 'authorization_code'
        },
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + (Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'))
            },
        })

        const profile = await axios.get<SpotifyApi.UserObjectPublic>('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': 'Bearer ' + result.data.access_token
            }   
        })

        let profilePicture = "";

        if (profile.data.images !== undefined) {
            if (profile.data.images.length > 0) {
                profilePicture = profile.data.images[0].url;
            }
        }

        const user = await prisma.user.create({
            data: {
                name: profile.data.display_name,
                image: profilePicture
            }
        })

        const account = await prisma.account.create({
            data: {
                type: profile.data.type,
                userId: user.id,
                provider: "spotify",
                providerAccountId: profile.data.id,
                refresh_token: result.data.refresh_token,
                access_token: result.data.access_token,
                expires_in: result.data.expires_in,
                token_type: result.data.token_type,
                scope: result.data.scope,
            }
        })
    }

    res.redirect(process.env.FRONTEND_URL || "http://localhost:3000");
})

export default router;