const tableName = 'configured_accounts';
exports.up = function (db) {
  let table = db.createTable(tableName, {
    team_id: {type: 'char', length: 9, notNull: true},
    alias: {type: 'string', length: 100, notNull: true},
    token: {type: 'string', length: 100, notNull: true},
    region: {type: 'string', length: 100, notNull: true},
    real_name: {type: 'string', length: 100, notNull: true}
  });
  db.addIndex(tableName, "teamToAlias", ["team_id", "alias"], true, () => {});
  return table;
};

exports.down = function (db) {
  return db.dropTable(tableName);
};
