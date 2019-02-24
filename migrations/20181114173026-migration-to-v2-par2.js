const sql= `insert into configured_accounts(team_id,alias,apiToken,region,realName)
select id,alias,region,apiToken,realName from
(select id, alias ,
SUBSTRING(bot,p3+1,p4-p3-1) as region,
SUBSTRING(bot,p5+1,p6-p5-1)  as apiToken,
SUBSTRING(bot,p7+1,p8-p7-1)  as realName
from
(select id,bot,'my-account' as alias,
LOCATE('\"',bot, LOCATE('\"',bot,LOCATE('accountRegion',bot))+1) as p3,
LOCATE('\"',bot, LOCATE('\"',bot, LOCATE('\"',bot,LOCATE('accountRegion',bot))+1)+1) as p4,
LOCATE('\"',bot, LOCATE('\"',bot,LOCATE('apiToken',bot))+1) as p5,
LOCATE('\"',bot, LOCATE('\"',bot, LOCATE('\"',bot,LOCATE('apiToken',bot))+1)+1) as p6,
LOCATE('\"',bot, LOCATE('\"',bot,LOCATE('name',bot))+1) as p7,
LOCATE('\"',bot, LOCATE('\"',bot, LOCATE('\"',bot,LOCATE('name',bot))+1)+1) as p8
from botkit_team)
as ms ) as ms
ON DUPLICATE KEY UPDATE alias = ms.alias, apiToken = ms.apiToken, region = ms.region, realName = ms.realName`

exports.up = function (db) {
  return db.runSql(sql, (err) => {console.log(err)});
};






