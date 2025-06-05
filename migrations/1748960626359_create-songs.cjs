module.exports = {
  up(pgm) {
    pgm.createTable('songs', {
      id: { type: 'varchar(50)', primaryKey: true },
      title: { type: 'text', notNull: true },
      year: { type: 'integer', notNull: true },
      genre: { type: 'text', notNull: true },
      performer: { type: 'text', notNull: true },
      duration: { type: 'integer' },
      album_id: {
        type: 'varchar(50)',
        references: 'albums(id)',
        onDelete: 'set null',
      },
    });
  },

  down(pgm) {
    pgm.dropTable('songs');
  },
};