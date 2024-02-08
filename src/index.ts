import express from 'express';
import dotenv from 'dotenv';

import spotifyAuthRoutes from './routes/auth/spotify';

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.use("/auth/spotify", spotifyAuthRoutes);