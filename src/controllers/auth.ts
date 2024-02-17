import { type Request, type Response } from 'express';
import { randomBytes } from 'crypto';
import querystring from 'querystring';

import { type SpotifyUserAuthorizationResponse } from '@/types/spotifyAuth';

import { createDbAccount, createDbUser } from '@/services/db';
import { getSpotifyProfile, requestSpotifyAccessToken } from '@/services/spotify';

// Always provide request and response types. Otherwise, 'res.cookie' will not be recognized
export const loginController = async (req: Request, res: Response) => {
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
}

export const callbackController = async (req: Request<{}, {}, {}, SpotifyUserAuthorizationResponse>, res: Response) => {
    console.log(req.signedCookies)
    const { stateParam } = req.signedCookies;
    console.log('HELLO')

    if (req.query.state !== stateParam) {
        res.status(403).send("State mismatch, potential CSRF detected");
        throw new Error(`Potential CSRF:\nCookie param: ${stateParam}\nQuery param: ${req.query.state}`);
    }
    else if ('error' in req.query) {
        res.status(403).send("User has not granted access to Spotify or an unexpected error occurred");
        throw new Error(req.query.error);
    }

    // Store the new access token
    const token = await requestSpotifyAccessToken(req.query.code);

    // Use the inital access token to get the user profile, which is needed to create a user in the database
    const userProfile = await getSpotifyProfile(token.access_token);

    //Create a user in the database
    const dbUser = await createDbUser(userProfile.display_name || userProfile.id, userProfile.id, userProfile.images);

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

    req.session.userId = dbUser.id;
    req.session.spotifyAccessToken = token.access_token;

    //Redirect user to the frontend
    res.redirect(process.env.FRONTEND_URL!);
}