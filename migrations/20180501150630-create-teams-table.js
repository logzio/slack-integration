exports.up = function (db) {
  return db.createTable('botkit_team', {
    id: { type: 'char', length: 9, notNull: true, primaryKey: true },
    createdBy: { type: 'char', length: 9, notNull: true },
    url: { type: 'string', length: 100, notNull: true },
    name: { type: 'string', length: 100, notNull: true },
    token: { type: 'string', length: 100, notNull: true },
    bot: { type: 'text', notNull: true },
  });
};

exports.down = function (db) {
  return db.dropTable('botkit_team');
};
