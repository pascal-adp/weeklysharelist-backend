import { type Request, type Response } from 'express';

import { getSpotifyTopTracks } from '@/services/spotify';


export const topTrackController = async (req: Request, res: Response) => {
    // User is authenticated in this route. We can ignore the typescript error
    const topTracks = await getSpotifyTopTracks(req.session.spotifyAccessToken!);
    // console.log(topTracks)
    res.json(topTracks).status(200);
}