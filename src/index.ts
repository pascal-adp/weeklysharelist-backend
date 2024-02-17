import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';

import apiRoutes from '@/routes/api'

import { sessionMiddleware } from '@/middlewares/session';
import { corsMiddleware } from '@/middlewares/cors';
import { errorMiddleware } from '@/middlewares/error';

dotenv.config();

const app = express();

// If run behind proxy (e.g. nginx)
// app.set('trust proxy', 1);

const port = process.env.PORT || 8000;


declare module "express-session" {
    interface SessionData {
      userId: string;
      spotifyAccessToken: string;
    }
}
app.use(sessionMiddleware)
app.use(corsMiddleware)
// app.use(helmet())

app.use('/api/v1', apiRoutes)

// app.use(errorMiddleware)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});