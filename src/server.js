// src/server.js
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
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;
    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }

      const newResponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
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