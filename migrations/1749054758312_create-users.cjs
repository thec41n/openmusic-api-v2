module.exports = {
  up: async (pgm) => {
    pgm.createTable('users', {
      id: {
        type: 'VARCHAR(50)',
        primaryKey: true,
      },
      username: {
        type: 'VARCHAR(50)',
        unique: true,
        notNull: true,
      },
      password: {
        type: 'TEXT',
        notNull: true,
      },
      fullname: {
        type: 'TEXT',
        notNull: true,
      },
    });
  },
  down: async (pgm) => {
    pgm.dropTable('users');
  },
};