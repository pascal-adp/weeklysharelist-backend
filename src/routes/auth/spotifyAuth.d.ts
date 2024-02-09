/**
 * Declerations taken from the Spotify API documentation
 * @see https://developer.spotify.com/documentation/web-api/tutorials/code-flow
 */

export type SpotifyAccessTokenResponse = {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
}

export type SpotifyUserAuthorizationResponse =
    | { code: string; state: string }
    | { error: string; state: string };

export interface SpotifyUserProfileResponse extends SpotifyApi.UserObjectPublic {
    images: string;
};