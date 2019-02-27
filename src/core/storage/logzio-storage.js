const mysql = require('mysql');
const SQL = require('sql-template-strings');
const BotkitStorageMySQL = require('../storage/botkit-storage-mysql');
const util = require('util');

module.exports = function(dbConfig) {
  const storage = new BotkitStorageMySQL(dbConfig);

  var getConfiguredAccounts = function(tableName) {
    return async function(id, alias) {
      var connection = mysql.createConnection(dbConfig);
      try {
        connection.connect();
        const queryPromise = util.promisify(connection.query).bind(connection);
        let rows = await queryPromise(
          SQL`SELECT * from `
            .append(tableName)
            .append(SQL` where team_id = ${id} AND alias = ${alias}`)
        );
        if (rows.length > 0) {
          return rows[0];
        }
      } finally {
        connection.end();
      }
    };
  };

  var saveConfiguredAccount = function(tableName) {
    return async function(data) {
      let team_id = data.team_id;
      let alias = data.alias;
      let apiToken = data.apiToken;
      let region = data.region;
      let realName = data.realName;
      var connection = mysql.createConnection(dbConfig);
      try {
        connection.connect();
        const queryPromise = util.promisify(connection.query).bind(connection);
        return queryPromise(
          SQL`INSERT into `
            .append(tableName)
            .append(SQL` (team_id, alias, apiToken, region, realName)`)
            .append(
              SQL` VALUES (${team_id}, ${alias}, ${apiToken}, ${region}, ${realName})`
            )
            .append(
              SQL` ON DUPLICATE KEY UPDATE alias = ${alias}, apiToken = ${apiToken}, region = ${region}, realName = ${realName}`
            )
        );
      } finally {
        connection.end();
      }
    };
  };

  var deleteConfiguredAccount = function(tableName) {
    return async function(id, alias) {
      var connection = mysql.createConnection(dbConfig);
      try {
        connection.connect();
        const queryPromise = util.promisify(connection.query).bind(connection);
        await queryPromise(
          SQL`DELETE from `
            .append(tableName)
            .append(SQL` where team_id = ${id} AND alias=${alias}`)
        );
        return true;
      } finally {
        connection.end();
      }
    };
  };

  var getAllConfiguredAccount = function(tableName) {
    return async function(id) {
      var connection = mysql.createConnection(dbConfig);
      try {
        connection.connect();
        const queryPromise = util.promisify(connection.query).bind(connection);
        let rows = await queryPromise(
          SQL`SELECT * from `
            .append(tableName)
            .append(SQL` where team_id = ${id}`)
        );
        var translatedData = [];
        for (var i = 0; i < rows.length; i++) {
          translatedData.push(rows[i]);
        }
        return translatedData;
      } finally {
        connection.end();
      }
    };
  };

  return {
    teams: {
      get: storage.teams.get,
      get_async: storage.teams.get_async,
      save: storage.teams.save,
      all: storage.teams.all,
      all_async: storage.teams.all_async
    },
    channels: {
      get: storage.channels.get,
      get_async: storage.channels.get_async,
      save: storage.channels.save,
      all: storage.channels.all,
      all_async: storage.channels.all_async
    },
    users: {
      get: storage.users.get,
      get_async: storage.users.get_async,
      save: storage.users.save,
      all: storage.users.all
    },
    configuredAccounts: {
      get: getConfiguredAccounts('configured_accounts'),
      save: saveConfiguredAccount('configured_accounts'),
      delete: deleteConfiguredAccount('configured_accounts'),
      all: getAllConfiguredAccount('configured_accounts')
    }
  };
};
