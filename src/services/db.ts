import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

export const updateDbAccountToken = async (accountId: string, accessToken: string, refreshToken: string, expiresAt: number) => {
    try {
        await prisma.account.update({
            where: {
                id: accountId
            },
            data: {
                access_token: accessToken,
                refresh_token: refreshToken,
                expires_at: expiresAt
            }
        })
    }
    catch (error) {
        throw new Error("Failed to update account token in database: " + error);
    }
}

export const getDbAccountByUserId = async (userId: string) => {
    try {
        const account = await prisma.account.findFirst({
            where: {
                userId: userId
            }
        })
        return account;
    }
    catch (error) {
        throw new Error("Failed to get account from database: " + error);
    }
}

export const getDbUserByUserId = async (userId: string) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                id: userId
            }
        })
        return user;
    }
    catch (error) {
        throw new Error("Failed to get user from database: " + error);
    }
};

export const getSharelistByUserId = async (userId: string) => {
    try {
        const sharelist = await prisma.sharelist.findUnique({
            where: {
                ownedById: userId
            }
        })
        return sharelist;
    }
    catch (error) {
        throw new Error("Failed to get sharelist from database: " + error);
    }
};

export const addSongToSharelist = async (userId: string, songData: Prisma.SharelistSongCreateInput) => {
    try {
        const sharelist = await getSharelistByUserId(userId);

        if (!sharelist) {
            throw new Error("Sharelist does not exist");
        }

        await prisma.sharelistSong.create({
            data: {
                belongsToSharelistId: sharelist.id,
                name: songData.name,
                album: songData.album,
                artists: songData.artists,
                cover:  songData.cover,
                spotifyTrackId: songData.spotifyTrackId,
            }
        })
    }
    catch (error) {
        throw new Error("Failed to add song to sharelist: " + error);
    }
};