import dotenv from 'dotenv';
import Hapi from '@hapi/hapi';
import albums from './api/albums/index.js';
import songs from './api/songs/index.js';
import AlbumService from './services/postgresql/AlbumService.js';
import AlbumsValidator from './validator/albums/index.js';
import SongService from './services/postgresql/SongService.js';
import SongsValidator from './validator/songs/index.js';
import ClientError from './exceptions/ClientError.js';
import users from './api/users/index.js';
import UserService from './services/postgresql/UserService.js';
import UsersValidator from './validator/users/index.js';
import authentications from './api/authentications/index.js';
import AuthenticationService from './services/postgresql/AuthenticationService.js';
import AuthenticationsValidator from './validator/authentications/index.js';
import playlists from './api/playlists/index.js';
import PlaylistService from './services/postgresql/PlaylistService.js';
import PlaylistsValidator from './validator/playlists/index.js';
import AuthorizationError from './exceptions/AuthorizationError.js';
import CollaborationsValidator from './validator/collaborations/index.js';
import collaborations from './api/collaborations/index.js';
import CollaborationService from './services/postgresql/CollaborationService.js';


import jwt from 'jsonwebtoken';

dotenv.config();

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  const albumService = new AlbumService();
  const songService = new SongService();
  const userService = new UserService();
  const authenticationService = new AuthenticationService();
  const playlistService = new PlaylistService();
  const collaborationService = new CollaborationService();

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumService,
        validator: AlbumsValidator,
        songsService: songService,
      },
    },
    {
      plugin: songs,
      options: {
        service: songService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: userService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        usersService: userService,
        authenticationsService: authenticationService,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationService: collaborationService,
        playlistService: playlistService,
        userService: userService,
        validator: CollaborationsValidator,
      },
    },
  ]);

  server.ext('onPreHandler', (request, h) => {
  const protectedPaths = [
    '/playlists',
    '/playlists/{id}',
    '/playlists/{playlistId}/songs',
    '/collaborations',
    '/playlists/{id}/activities',
  ];

  const isProtected = protectedPaths.some(path => {
    return request.route && request.route.path === path;
  });

  if (isProtected) {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthorizationError('Missing authentication');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);

      if (!decoded || typeof decoded.userId !== 'string' || decoded.userId.trim() === '') {
        throw new AuthorizationError('Invalid Access Token: userId not found in token');
      }

      request.auth = {
        credentials: {
          id: decoded.userId,
        },
      };
    } catch (error) {
      console.error('Error verifying token in manual middleware:', error.message);

      if (error.name === 'TokenExpiredError') {
        throw new AuthorizationError('Access Token Expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new AuthorizationError('Invalid Access Token');
      }
      throw new AuthorizationError('Failed to authenticate token');
    }
  }
  return h.continue;
});

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;
    

    if (response instanceof AuthorizationError) {
    let statusCode = response.statusCode;
    let errorType = 'Forbidden';

    if (response.message === 'Missing authentication' || response.message === 'Invalid Access Token') {
      statusCode = 401;
      errorType = 'Unauthorized';
    }

    const newResponse = h.response({
      status: 'fail',
      message: response.message,
      statusCode: statusCode,
      error: errorType,
    });
    newResponse.code(statusCode);
    return newResponse;
  }

    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
        statusCode: response.statusCode,
        error: response.statusCode === 404 ? 'Not Found' : 'Bad Request',
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    if (!response.isServer && response.output && response.output.statusCode) {
      const newResponse = h.response({
        status: 'fail',
        message: response.output.payload.message || 'An unexpected client error occurred',
        statusCode: response.output.statusCode,
        error: response.output.payload.error || 'Bad Request',
      });
      newResponse.code(response.output.statusCode);
      return newResponse;
    }

    if (response instanceof Error) {
      const newResponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
        statusCode: 500,
        error: 'Internal Server Error',
      });
      newResponse.code(500);
      console.error(response);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server jalan di ${server.info.uri}`);
};

init();