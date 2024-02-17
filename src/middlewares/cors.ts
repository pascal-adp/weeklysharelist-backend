import cors from "cors";

export const corsMiddleware = cors({
    // origin: ['http://localhost:3000', 'https://accounts.spotify.com'],
    // credentials: true,
    // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    // allowedHeaders: ['Content-Type', 'Authorization'],
})