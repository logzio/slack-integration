const tableName = 'configured_accounts';
exports.up = function (db) {
  let table = db.createTable(tableName, {
    team_id: {type: 'char', length: 9, notNull: true},
    alias: {type: 'string', length: 100, notNull: true},
    apiToken: {type: 'string', length: 100, notNull: true},
    region: {type: 'string', length: 100, notNull: true},
    realName: {type: 'string', length: 100, notNull: true}
  });
  return table;
};

exports.down = function (db) {
  return db.dropTable(tableName);
};
