
exports.up = function (db) {
  db.runSql(`alter table botkit_channel change column id id char(100) NOT NULL`, (err) => {console.log(err)});
  db.runSql(`alter table botkit_team change column id id char(100) NOT NULL`, (err) => {console.log(err)});
  db.runSql(`alter table botkit_team change column createdBy createdBy char(100) NOT NULL`, (err) => {console.log(err)});
  db.runSql(`alter table botkit_user change column id id char(100) NOT NULL`, (err) => {console.log(err)});
  db.runSql(`alter table botkit_user change column team_id team_id char(100) NOT NULL`, (err) => {console.log(err)});
  return db.runSql(`alter table configured_accounts change column team_id team_id char(100) NOT NULL`, (err) => {console.log(err)});
};
