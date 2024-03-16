import { addSongToCache, addSongToSharelist, createSharelist, deleteSongFromSharelist, getSharelistByUserId, getSharelistSongsBySharelistId, getSongBySpotifyTrackId } from '@/services/db';
import { type Request, type Response } from 'express';

export const addSongController = async (req: Request<{}, {}>, res: Response) => {
    const { name, album, artists, cover, spotifyTrackId } = req.body;
    let sharelist = await getSharelistByUserId(req.session.userId!);

    if (!sharelist) {
        await createSharelist(req.session.userId!);
    }

    sharelist = await getSharelistByUserId(req.session.userId!);

    if(!sharelist) {
        res.status(500).json({ error: "Failed to retrieve sharelist" });
        return;
    }

    const sharelistSongs = await getSharelistSongsBySharelistId(sharelist!.id)

    if (sharelistSongs.length >= 3) {
        res.status(400).json({ error: "Sharelist is full" });
        return;
    }

    let song = await getSongBySpotifyTrackId(spotifyTrackId);

    if (!song) {
        song = await addSongToCache({
            name: name,
            album: album,
            artists: artists,
            cover: cover,
            spotifyTrackId: spotifyTrackId,
        })
    }

    await addSongToSharelist(req.session.userId!, song.id);
    res.status(200).send({ message: "Song added to sharelist" });
};

export const getSharelistSongsController = async (req: Request, res: Response) => {
    const sharelist = await getSharelistByUserId(req.session.userId!);

    if (!sharelist) {
        res.status(404).json({ error: "Sharelist not found" });
        return;
    }

    const sharelistSongs = await getSharelistSongsBySharelistId(sharelist.id);

    res.status(200).json(sharelistSongs);
}

export const deleteSongController = async (req: Request, res: Response) => {
    const sharelist = await getSharelistByUserId(req.session.userId!);
    await deleteSongFromSharelist(sharelist!.id, req.params.spotifyTrackId);
    res.status(200).end();
}