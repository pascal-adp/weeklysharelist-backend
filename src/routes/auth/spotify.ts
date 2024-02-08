import { Router } from 'express';
import { randomBytes } from 'crypto';
import querystring from 'querystring';

const router = Router();

router.get("/login", (req, res) => {
    const state = randomBytes(8).toString('hex');
    const scope = "user-top-read";

    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: process.env.CLIENT_ID,
            scope: scope,
            redirect_uri: process.env.URL + "/auth/spotify/callback",
            state: state
        }));
});

router.get("/callback", (req, res) => {
    console.log(req.query);

    res.redirect(process.env.FRONTEND_URL || "http://localhost:3000");
})

export default router;