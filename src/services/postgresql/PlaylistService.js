import { nanoid } from 'nanoid';
import pkg from 'pg';
const { Pool } = pkg;
import InvariantError from '../../exceptions/InvariantError.js';
import NotFoundError from '../../exceptions/NotFoundError.js';
import AuthorizationError from '../../exceptions/AuthorizationError.js';
import CollaborationService from './CollaborationService.js';

class PlaylistService {
  constructor() {
    this._pool = new Pool();
    this._collaborationService = new CollaborationService();

    this.addPlaylist = this.addPlaylist.bind(this);
    this.getPlaylists = this.getPlaylists.bind(this);
    this.deletePlaylistById = this.deletePlaylistById.bind(this);
    this.verifyPlaylistOwner = this.verifyPlaylistOwner.bind(this);
    this.verifyPlaylistAccess = this.verifyPlaylistAccess.bind(this);
    this.addSongToPlaylist = this.addSongToPlaylist.bind(this);
    this.getSongsInPlaylist = this.getSongsInPlaylist.bind(this);
    this.deleteSongFromPlaylist = this.deleteSongFromPlaylist.bind(this);
    this.verifySongExists = this.verifySongExists.bind(this);
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists (id, name, owner) VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `
        SELECT DISTINCT ON (playlists.id) playlists.id, playlists.name, users.username 
        FROM playlists
        LEFT JOIN users ON playlists.owner = users.id
        LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
        WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
      values: [owner],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async deletePlaylistById(id, owner) {
    await this.verifyPlaylistOwner(id, owner);

    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      if (error instanceof AuthorizationError) {
        try {
          await this._collaborationService.verifyCollaborator(playlistId, userId);
        } catch {
          throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
      } else {
        throw error;
      }
    }
  }

  async verifyPlaylistOwner(playlistId, owner) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async addSongToPlaylist({ playlistId, songId }) {
    await this.verifySongExists(songId);

    const id = `playlist_song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs (id, playlist_id, song_id) VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    try {
      await this._pool.query(query);
    } catch (error) {
      if (error.code === '23505') {
        throw new InvariantError('Lagu sudah ada di dalam playlist ini.');
      }
      throw error;
    }
  }

  async getSongsInPlaylist(playlistId) {
    const query = {
      text: `
        SELECT 
          playlists.id, 
          playlists.name, 
          users.username,
          json_agg(
            json_build_object(
              'id', songs.id,
              'title', songs.title,
              'performer', songs.performer
            ) ORDER BY songs.title -- Tambahkan ORDER BY untuk konsistensi
          ) AS songs
        FROM playlists
        LEFT JOIN users ON playlists.owner = users.id
        LEFT JOIN playlist_songs ON playlist_songs.playlist_id = playlists.id
        LEFT JOIN songs ON songs.id = playlist_songs.song_id
        WHERE playlists.id = $1
        GROUP BY playlists.id, users.username`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];
    if (playlist.songs.length > 0 && playlist.songs[0].id === null) {
      playlist.songs = [];
    }

    return playlist;
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan di playlist ini');
    }
  }

  async verifySongExists(songId) {
    const query = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [songId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
  }
}

export default PlaylistService;