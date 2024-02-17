import axios from 'axios';
import { type SpotifyAccessTokenResponse, type SpotifyUserProfileResponse } from '@/types/spotifyAuth.d';

export const requestSpotifyAccessToken = async (authCode: string): Promise<SpotifyAccessTokenResponse> => {
    try {
        const response = await axios.post<SpotifyAccessTokenResponse>('https://accounts.spotify.com/api/token', {
            code: authCode,
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
        throw new Error("Failed to request access token from Spotify: " + error);
    }
}

export const getSpotifyProfile = async (accessToken: string): Promise<SpotifyUserProfileResponse> => {
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