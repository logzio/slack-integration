const sql=`update botkit_team set bot = replace(bot,'\"configuration\":{\"'  , CONCAT('\"configuration\":{\"alias\":\"my-account\",\"realName\":\"',name,'\",'))  from botkit_team where bot not like '%\"alias\"%' and bot like '%apiToken%'`
exports.up = function (db) {
  return db.runSql(sql, (err) => {console.log(err)});
};





