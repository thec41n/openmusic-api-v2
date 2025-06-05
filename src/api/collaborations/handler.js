class CollaborationsHandler {
  constructor(collaborationService, playlistService, userService, validator) {
    this._collaborationService = collaborationService;
    this._playlistService = playlistService;
    this._userService = userService;
    this._validator = validator;

    this.postCollaborationHandler = this.postCollaborationHandler.bind(this);
    this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this);
  }

  async postCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);

    const { playlistId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);

    const collaborationId = await this._collaborationService.addCollaboration({
      playlistId,
      userId,
    });

    const response = h.response({
      status: 'success',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);

    const { playlistId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials; 

    await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);

    await this._collaborationService.deleteCollaboration(playlistId, userId);

    return h.response({
      status: 'success',
      message: 'Kolaborasi berhasil dihapus',
    });
  }
}

export default CollaborationsHandler;