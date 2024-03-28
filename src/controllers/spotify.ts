import { type Request, type Response } from 'express';

import { getSpotifyTopTracks, searchSpotifyTrack } from '@/services/spotify';


export const topTrackController = async (req: Request, res: Response) => {
    // User is authenticated in this route. We can ignore the typescript error
    const topTracks = await getSpotifyTopTracks(req.session.spotifyAccessToken!);
    // console.log(topTracks)
    res.status(200).json(topTracks);
}

export const searchTrackController = async (req: Request, res: Response) => {
    const query = req.query.q as string;
    try {
        const searchResults = await searchSpotifyTrack(req.session.spotifyAccessToken!, query);

        if(searchResults.tracks) {
            res.status(200).json(searchResults.tracks.items);
        }
        else {
            res.status(500).json({ error: "Failed to search track" });
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
    }
}