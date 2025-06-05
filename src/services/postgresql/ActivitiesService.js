import { nanoid } from 'nanoid';
import pkg from 'pg';
const { Pool } = pkg;
import InvariantError from '../../exceptions/InvariantError.js';
import NotFoundError from '../../exceptions/NotFoundError.js';

class ActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylistActivity({ playlistId, songId, userId, action }) {
    const id = `activity-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: `
        INSERT INTO playlist_song_activities 
        (id, playlist_id, song_id, user_id, action, time)
        VALUES($1, $2, $3, $4, $5, $6) RETURNING id`,
      values: [id, playlistId, songId, userId, action, time],
    };

    await this._pool.query(query);
  }

  async getPlaylistActivities(playlistId) {
    const query = {
      text: `
        SELECT 
          users.username, 
          songs.title, 
          playlist_song_activities.action, 
          playlist_song_activities.time
        FROM playlist_song_activities
        LEFT JOIN users ON users.id = playlist_song_activities.user_id
        LEFT JOIN songs ON songs.id = playlist_song_activities.song_id
        WHERE playlist_song_activities.playlist_id = $1
        ORDER BY playlist_song_activities.time ASC`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    return {
        playlistId,
        activities: result.rows,
    };
  }
}

export default ActivitiesService;