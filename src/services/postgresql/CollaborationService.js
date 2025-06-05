import { nanoid } from 'nanoid';
import pkg from 'pg';
const { Pool } = pkg;
import InvariantError from '../../exceptions/InvariantError.js';
import NotFoundError from '../../exceptions/NotFoundError.js';

class CollaborationService {
  constructor() {
    this._pool = new Pool();
  }

  async addCollaboration({ playlistId, userId }) {
    await this.verifyPlaylistAndUserExist(playlistId, userId);

    const id = `collab-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO collaborations (id, playlist_id, user_id) VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    try {
      const result = await this._pool.query(query);

      if (!result.rowCount) {
        throw new InvariantError('Kolaborasi gagal ditambahkan');
      }
      return result.rows[0].id;
    } catch (error) {
      if (error.code === '23505') {
        throw new InvariantError('Kolaborasi sudah ada untuk playlist ini.');
      }
      throw error;
    }
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Kolaborasi tidak ditemukan');
    }
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT id FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Anda bukan kolaborator untuk playlist ini');
    }
  }
  
  async verifyPlaylistAndUserExist(playlistId, userId) {
    const playlistQuery = {
      text: 'SELECT id FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const playlistResult = await this._pool.query(playlistQuery);
    if (!playlistResult.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const userQuery = {
      text: 'SELECT id FROM users WHERE id = $1',
      values: [userId],
    };
    const userResult = await this._pool.query(userQuery);
    if (!userResult.rowCount) {
      throw new NotFoundError('User tidak ditemukan');
    }
  }
}

export default CollaborationService;