declare module "express-session" {
    interface SessionData {
      userId: string;
      spotifyAccessToken: string;
    }
}

export {}; // Makes file not a script but a module