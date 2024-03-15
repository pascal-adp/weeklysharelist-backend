import { addSongToSharelist, createSharelist, deleteSongFromSharelist, getSharelistByUserId, getSharelistSongsBySharelistId } from '@/services/db';
import { type Request, type Response } from 'express';

export const addSongController = async (req: Request<{}, {}>, res: Response) => {
    const { name, album, artists, cover, spotifyTrackId } = req.body;
    let sharelist = await getSharelistByUserId(req.session.userId!);

    if (!sharelist) {
        await createSharelist(req.session.userId!);
    }

    sharelist = await getSharelistByUserId(req.session.userId!);
    const sharelistSongs = await getSharelistSongsBySharelistId(sharelist!.id)

    if (sharelistSongs.length >= 3) {
        res.status(400).json({ error: "Sharelist is full" });
        return;
    }
    await addSongToSharelist(req.session.userId!, {
        name: name,
        album: album,
        artists: artists,
        cover: cover,
        spotifyTrackId: spotifyTrackId,
        belongsToSharelist: sharelist!.id
    });
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
}