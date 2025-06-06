import pkg from 'pg';
const { Pool } = pkg;
import InvariantError from '../../exceptions/InvariantError.js';

class AuthenticationService {
  constructor() {
    this._pool = new Pool();
  }

  async addRefreshToken(token) {
  const query = {
    text: 'INSERT INTO authentications (token) VALUES($1)',
    values: [token],
  };
  await this._pool.query(query);
}

  async verifyRefreshToken(token) {
  const query = {
    text: 'SELECT token FROM authentications WHERE token = $1',
    values: [token],
  };
  const result = await this._pool.query(query);
  if (!result.rowCount) {
    throw new InvariantError('Refresh token tidak valid');
  }
}

  async deleteRefreshToken(token) {
    const query = {
      text: 'DELETE FROM authentications WHERE token = $1 RETURNING token',
      values: [token],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Refresh token tidak valid');
    }
  }
}

export default AuthenticationService;