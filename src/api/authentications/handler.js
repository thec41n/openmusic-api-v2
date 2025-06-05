import InvariantError from '../../exceptions/InvariantError.js';
import jwt from 'jsonwebtoken';

class AuthenticationsHandler {
  constructor(usersService, authenticationsService, validator) {
    this._usersService = usersService;
    this._authenticationsService = authenticationsService;
    this._validator = validator;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
  }

  async postAuthenticationHandler(request, h) {
    this._validator.validatePostAuthenticationPayload(request.payload);

    const { username, password } = request.payload;

    const userId = await this._usersService.verifyUserCredential(username, password);

    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_KEY, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_KEY);

    await this._authenticationsService.addRefreshToken(refreshToken);

    const response = h.response({
      status: 'success',
      data: {
        accessToken,
        refreshToken,
      },
    });
    response.code(201);
    return response;
  }

  async putAuthenticationHandler(request, h) {
    this._validator.validatePutAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;

    await this._authenticationsService.verifyRefreshToken(refreshToken);

    try {
      const credentials = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
      const userId = credentials.userId;
      const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_KEY, { expiresIn: '1h' });
      return h.response({
        status: 'success',
        data: { accessToken },
      });
    } catch {
      throw new InvariantError('Refresh token tidak valid');
    }
  }

  async deleteAuthenticationHandler(request, h) {
    this._validator.validateDeleteAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;

    await this._authenticationsService.deleteRefreshToken(refreshToken);

    return h.response({
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    });
  }
}

export default AuthenticationsHandler;