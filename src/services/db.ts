import { Prisma, PrismaClient, type Song } from "@prisma/client";
// import pg from "pg";

// const pool = new pg.Pool({
//     user: process.env.DB,
//     host: process.env.DB_HOST,
//     database: process.env.DB_NAME,
//     password: process.env.DB_PASSWORD,
//     port: 5432
// })

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

export const addSongToSharelist = async (userId: string, songId: string) => {
    try {
        const sharelist = await getSharelistByUserId(userId);

        if (!sharelist) {
            throw new Error("Sharelist does not exist");
        }

        await prisma.sharelistSong.create({
            data: {
                belongsToSharelistId: sharelist.id,
                songId: songId
            }
        })
    }
    catch (error) {
        throw new Error("Failed to add song to sharelist: " + error);
    }
};

export const createSharelist = async (userId: string) => {
    try {
        const sharelist = await prisma.sharelist.create({
            data: {
                ownedById: userId
            }
        })
        return sharelist;
    }
    catch (error) {
        throw new Error("Failed to create sharelist: " + error);
    }
}

export const getSharelistSongsBySharelistId = async (sharelistId: string) => {
    try {
        const sharelist = await prisma.sharelist.findUnique({
            where: {
                id: sharelistId
            },
            select: {
                songs: {
                    include: {
                        song: true
                    }
                }
            }
        })
        if (!sharelist) {
            throw new Error("Sharelist does not exist");
        }

        const songs = sharelist.songs.map((sharelistSong) => sharelistSong.song);

        return songs;
    }
    catch (error) {
        throw new Error("Failed to get sharelist songs: " + error);
    }
}

export const deleteSongFromSharelist = async (sharelistId: string, spotifyTrackId: string) => {
    try {
        const song = await prisma.song.findUnique({
            where: {
                spotifyTrackId: spotifyTrackId
            }
        })

        if (!song) {
            throw new Error("Song does not exist");
            return
        }

        const link = await prisma.sharelistSong.findFirst({
            where: {
                belongsToSharelistId: sharelistId,
                songId: song.id
            }
        })

        if (!link) {
            throw new Error("Link does not exist");
            return
        }

        await prisma.sharelistSong.delete({
            where: {
                id: link.id
            }
        })
    }
    catch (error) {
        throw new Error("Failed to delete song from sharelist: " + error);
    }
}

export const getSongBySpotifyTrackId = async (spotifyTrackId: string) => {
    try {
        const song = await prisma.song.findUnique({
            where: {
                spotifyTrackId: spotifyTrackId
            }
        })
        return song;
    }
    catch (error) {
        throw new Error("Failed to get song from database: " + error);
    }
}

export const addSongToCache = async (songData: any) => {
    try {
        const song = await prisma.song.create({
            data: {
                ...songData
            }
        })
        return song;
    }
    catch (error) {
        throw new Error("Failed to add song to cache: " + error);
    }
}

// SELECT friends FROM Users WHERE userId
export const getAllFriendsByUserId = async (userId: string) => {
    // try {
    //     const user = await prisma.user.findUnique({
    //         where: {
    //             id: userId
    //         },
    //         select: {
    //             friends: {
    //                 include: {
    //                     friends: true
    //                 }
    //             }
    //         }
    //     })
    //     return user?.friends
    // }
    // catch(error) {
    //     throw new Error("Failed to get all friends: " + error)
    // }
}

export const addFriendUUID = async (userId: string, uuid: string, expires_at: number) => {
    try {
        const res = await prisma.userShared.create({
            data: {
                userId: userId,
                userUUID: uuid,
                expires_at: expires_at
            }
        })
        console.log(res)
        return res;
    }
    catch(error) {
        throw new Error("Failed to add friend uuid: " + error)
    }
}