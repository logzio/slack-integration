const sql=`update botkit_team set bot = replace(bot,"\\"configuration\\":{", CONCAT("\\"configuration\\":{\\"alias\\":\\"my-account\\",\\"realName\\":\\"",name,"\\",")) where bot not like '%\\"alias\\"%'`
exports.up = function (db) {
  return db.runSql(sql, (err) => {console.log(err)});
};






