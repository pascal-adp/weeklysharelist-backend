import axios from 'axios';
import { Prisma, PrismaClient } from "@prisma/client";
import { type SpotifyAccessTokenResponse, type SpotifyUserProfileResponse } from '@/types/spotifyAuth.d';

const prisma = new PrismaClient();

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

export const createDbUser = async (display_name: string, accountUserId: string, image: string) => {
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

export const createDbAccount = async (data: Prisma.AccountCreateInput) => {
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