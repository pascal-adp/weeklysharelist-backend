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