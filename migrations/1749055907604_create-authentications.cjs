module.exports = {
  up: async (pgm) => {
    pgm.createTable('authentications', {
      token: {
        type: 'TEXT',
        notNull: true,
      },
    });
  },
  down: async (pgm) => {
    pgm.dropTable('authentications');
  },
};