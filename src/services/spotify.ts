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

export const getSpotifyRefreshToken = async (refreshToken: string) => {
    try {
        const response = await axios.post<SpotifyAccessTokenResponse>('https://accounts.spotify.com/api/token', {
            grant_type: 'refresh_token',
            refresh_token: refreshToken
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
        throw new Error("Failed to get refresh token from Spotify: " + error);
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

export const getSpotifyTopTracks = async (accessToken: string) => {
    const URL = "https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=10&offset=0";
    try {
        const response = await axios.get<SpotifyApi.UsersTopTracksResponse>(URL, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return response.data;
    } catch (error) {
        // console.error(error);
    }
};

export const searchSpotifyTrack = async (accessToken: string, query: string) => {
    const URL = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=5`;
    try {
        const response = await axios.get<SpotifyApi.SearchResponse>(URL, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to get top tracks from Spotify: ${error}`);
    }
}

export const concatSpotifyArtists = (artists: SpotifyApi.ArtistObjectSimplified[]) => {
    const artistsNames: string[] = [];
    artists.forEach((artist) => {
        artistsNames.push(artist.name);
    });
    return artistsNames.join(", ");
};