import { addSongToSharelist, createSharelist, getSharelistByUserId } from '@/services/db';
import { type Request, type Response } from 'express';

export const addSongController = async (req: Request<{}, {}>, res: Response) => {
    const { name, album, artists, cover, spotifyTrackId } = req.body;
    let sharelist = await getSharelistByUserId(req.session.userId!);

    if (!sharelist) {
        await createSharelist(req.session.userId!);
    }

    sharelist = await getSharelistByUserId(req.session.userId!);

    await addSongToSharelist(req.session.userId!, {
        name: name,
        album: album,
        artists: artists,
        cover: cover,
        spotifyTrackId: spotifyTrackId,
        belongsToSharelist: sharelist!.id
    });
};