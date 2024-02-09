import axios from 'axios';
import { type Request, type Response, Router } from 'express';
import cookieParser from 'cookie-parser'
import { Prisma, PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';
import querystring from 'querystring';

import { type SpotifyAccessTokenResponse, type SpotifyUserAuthorizationResponse, type SpotifyUserProfileResponse } from './spotifyAuth.d';

const router = Router();
const prisma = new PrismaClient();

router.use(cookieParser(process.env.COOKIE_SECRET))

router.get("/login", (_, res: Response) => {
    const stateParam = randomBytes(8).toString('hex');
    const spotifyAuthScope = "user-top-read";

    // Store the state for 2 minutes in a cookie
    res.cookie('stateParam', stateParam, { maxAge: 1000 * 60 * 2, signed: true });

    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: process.env.CLIENT_ID,
            scope: spotifyAuthScope,
            redirect_uri: process.env.URL + "/api/v1/auth/spotify/callback",
            state: stateParam
        }));
});

router.get("/callback", async (req: Request<{}, {}, {}, SpotifyUserAuthorizationResponse>, res) => {
    const { stateParam } = req.signedCookies;

    if (req.query.state !== stateParam) {
        res.status(403).send("State mismatch, potential CSRF detected");
        throw new Error(`Potential CSRF:\nCookie param: ${stateParam}\nQuery param: ${req.query.state}`);
    }
    else if ('error' in req.query) {
        res.status(403).send("User has not granted access to Spotify or an unexpected error occurred");
        throw new Error(req.query.error);
    }

    // Store the new access token
    const token = await requestSpotifyAccessToken(req.query.code, res);

    // Use the inital access token to get the user profile, which is needed to create a user in the database
    const userProfile = await getSpotifyProfile(token.access_token, res);

    //Create a user in the database
    const dbUser = await createDbUser(userProfile.display_name || userProfile.id, userProfile.id, userProfile.images, res);

    //Create the Spotify account that links to the user in the database
    await createDbAccount({
        type: userProfile.type,
        user: {
            connect: {
                id: dbUser.id
            }
        },
        provider: "spotify",
        providerAccountId: userProfile.id,
        refresh_token: token.refresh_token,
        access_token: token.access_token,
        expires_at: (Date.now() / 1000) + token.expires_in,
        token_type: token.token_type,
        scope: token.scope,
    });

    //Redirect user to the frontend
    res.redirect(process.env.FRONTEND_URL!);
})

const requestSpotifyAccessToken = async (code: string, res: Response): Promise<SpotifyAccessTokenResponse> => {
    try {
        const response = await axios.post<SpotifyAccessTokenResponse>('https://accounts.spotify.com/api/token', {
            code: code,
            redirect_uri: process.env.URL + "/api/v1/auth/spotify/callback",
            grant_type: 'authorization_code'
        },
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + (Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'))
                },
            })
        return response.data;
    }
    catch (error) {
        res.status(500).send("Failed to request access token from Spotify");
        throw new Error("Failed to request access token from Spotify: " + error);
    }
}

const getSpotifyProfile = async (accessToken: string, res: Response): Promise<SpotifyUserProfileResponse> => {
    try {
        const response = await axios.get<SpotifyApi.UserObjectPublic>('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        })
        const userProfile = response.data;

        // Somehow Spotify returns an empty array instead of undefined in some cases
        if (userProfile.images === undefined || userProfile.images.length === 0) {
            userProfile.images = undefined;
        }

        return {
            ...userProfile,
            images: userProfile.images === undefined ? "" : userProfile.images[0].url
        }
    }
    catch (error) {
        throw new Error("Failed to get user profile from Spotify: " + error);
    }
}

const createDbUser = async (display_name: string, accountUserId: string, image: string, res: Response) => {
    try {
        const existingDbUser = await prisma.user.findUnique({
            where: {
                spotifyAccountId: accountUserId
            }
        })

        if (existingDbUser) {
            throw new Error("User already exists in database");
        }

        const dbUser = await prisma.user.create({
            data: {
                name: display_name,
                spotifyAccountId: accountUserId,
                image: image
            }
        })
        return dbUser;
    }
    catch (error) {
        throw new Error("Failed to create user in database: " + error);
    }
}

const createDbAccount = async (data: Prisma.AccountCreateInput) => {
    try {
        const existingDbAccount = await prisma.account.findUnique({
            where: {
                providerAccountId: data.providerAccountId
            }
        });

        if (existingDbAccount && existingDbAccount.provider === data.provider) {
            throw new Error("Account already exists in database");
        }

        await prisma.account.create({
            data: data
        })
    }
    catch (error) {
        throw new Error("Failed to create account in database: " + error);
    }
}

export default router;