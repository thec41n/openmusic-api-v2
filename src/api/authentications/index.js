import AuthenticationsHandler from './handler.js';
import routes from './routes.js';

export default {
  name: 'authentications',
  version: '1.0.0',
  register: async (server, { usersService, authenticationsService, validator }) => {
    const authenticationsHandler = new AuthenticationsHandler(
      usersService,
      authenticationsService,
      validator,
    );
    server.route(routes(authenticationsHandler));
  },
};