import AuthorizationError from '../../exceptions/AuthorizationError.js';

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
    this.getSongsInPlaylistHandler = this.getSongsInPlaylistHandler.bind(this);
    this.deleteSongFromPlaylistHandler =
      this.deleteSongFromPlaylistHandler.bind(this);
    this.getPlaylistActivitiesHandler =
      this.getPlaylistActivitiesHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);
    const { name } = request.payload;
    if (
      !request.auth ||
      !request.auth.credentials ||
      typeof request.auth.credentials.id !== 'string'
    ) {
      throw new AuthorizationError('Missing or invalid credentials');
    }
    const { id: credentialId } = request.auth.credentials;
    const playlistId = await this._service.addPlaylist({
      name,
      owner: credentialId,
    });
    const response = h.response({ status: 'success', data: { playlistId } });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._service.getPlaylists(credentialId);
    return { status: 'success', data: { playlists } };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistOwner(id, credentialId);
    await this._service.deletePlaylistById(id, credentialId);
    return { status: 'success', message: 'Playlist berhasil dihapus' };
  }

  async postSongToPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistSongPayload(request.payload);

    const { playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);

    await this._service.addSongToPlaylist({
      playlistId,
      songId,
      userId: credentialId,
    });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getSongsInPlaylistHandler(request) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, credentialId); // <-- INI YANG BENAR

    const playlist = await this._service.getSongsInPlaylist(playlistId);

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongFromPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistSongPayload(request.payload);
    const { playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);

    await this._service.deleteSongFromPlaylist(
      playlistId,
      songId,
      credentialId
    );

    return h.response({
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    });
  }

  async getPlaylistActivitiesHandler(request) {
    const { playlistId } = request.params;
    if (
      !request.auth ||
      !request.auth.credentials ||
      typeof request.auth.credentials.id !== 'string'
    ) {
      throw new AuthorizationError(
        'Missing or invalid credentials for accessing activities'
      );
    }
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);

    const activities =
      await this._service._activitiesService.getPlaylistActivities(playlistId);

    return {
      status: 'success',
      data: activities,
    };
  }
}

export default PlaylistsHandler;
