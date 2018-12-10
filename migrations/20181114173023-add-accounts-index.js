const tableName = 'configured_accounts';
exports.up = function (db) {
  return db.addIndex(tableName, "teamToAlias", ["team_id", "alias"], true, (err) => {console.log(err)});
};

exports.down = function (db) {
  return db.dropTable(tableName);
};
