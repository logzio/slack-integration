exports.up = function (db) {
  return db.createTable('botkit_user', {
    id: { type: 'char', length: 9, notNull: true, primaryKey: true },
    access_token: { type: 'string', length: 100, notNull: true },
    scopes: { type: 'string', length: 500, notNull: true },
    team_id: { type: 'char', length: 9, notNull: true, primaryKey: true },
    user: { type: 'string', length: 36, notNull: true },
  });
};

exports.down = function (db) {
  return db.dropTable('botkit_user');
};
