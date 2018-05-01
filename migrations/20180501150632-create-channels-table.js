exports.up = function (db) {
  return db.createTable('botkit_channel', {
    id: { type: 'char', length: 9, notNull: true, primaryKey: true },
    json: { type: 'text', notNull: true },
  });
};

exports.down = function (db) {
  return db.dropTable('botkit_channel');
};
