const sql= `alter table configured_accounts add column createdAt DATETIME DEFAULT CURRENT_TIMESTAMP `

exports.up = function (db) {
  return db.runSql(sql, (err) => {console.log(err)});
};






