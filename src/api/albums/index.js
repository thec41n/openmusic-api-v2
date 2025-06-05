import AlbumsHandler from './handler.js';
import routes from './routes.js';

export default {
  name: 'albums',
  version: '1.0.0',
  register: async (server, { service, validator, songsService }) => {
    const albumsHandler = new AlbumsHandler(service, validator, songsService);
    server.route(routes(albumsHandler));
  },
};