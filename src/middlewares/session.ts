import RedisStore from 'connect-redis';
import session from 'express-session';

import { redisClient } from '@/db/redis';

export const sessionMiddleware = session({
    store: new RedisStore({ client: redisClient }),
    secret: 'hello gamers',
    resave: false,
    saveUninitialized: false,
    name: 'sessionId', // Custom name so it is unclear that we use express-session
    cookie: {
        httpOnly: true,
        secure: false, // Set to TRUE in production to enable HTTPS
        maxAge: 1000 * 60 * 60 * 24
    }
})