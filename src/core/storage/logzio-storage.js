const mysql = require('mysql');
const SQL = require('sql-template-strings');
const BotkitStorageMySQL = require('../storage/botkit-storage-mysql');

module.exports = function (dbConfig) {
  const storage = new BotkitStorageMySQL(dbConfig);

  function getConfiguredAccounts(tableName) {
    return (id, alias, callback) => {
      let connection = mysql.createConnection(dbConfig);
      try {
        connection.connect();
        connection.query(SQL`SELECT * FROM `
            .append(tableName)
            .append(SQL` WHERE team_id=${id} AND alias=${alias}`),
          (err, rows) => {
            callback(err, rows[0]);
          });
      }
      finally {
        connection.end();
      }
    }
  }

  function saveConfiguredAccount(tableName) {
    return (data, callback) => {
      let team_id = data.team_id;
      let alias = data.alias;
      let token = data.token;
      let region = data.region;
      let real_name = data.real_name;

      let connection = mysql.createConnection(dbConfig);
      try {
        connection.connect();
        connection.query(SQL`INSERT into `.append(tableName)
            .append(SQL` (team_id, alias, token, region, real_name)`)
            .append(SQL` VALUES (${team_id}, ${alias}, ${token}, ${region}, ${real_name})`)
            .append(SQL` ON DUPLICATE KEY UPDATE alias = ${alias}, token = ${token}, region = ${region}, real_name = ${real_name}`),
          err => callback(err)
        );

      } finally {
        connection.end();
      }
    }
  }

  function deleteConfiguredAccount(tableName) {
    return (id, alias, callback) => {
      let connection = mysql.createConnection(dbConfig);
      try{
        connection.connect();
        connection.query(
          SQL`DELETE FROM `.append(tableName)
            .append(SQL` WHERE team_id=${id} AND alias=${alias}`),
          err => callback(err)
        );
      } finally {
        connection.end();
      }
    }
  }

  function getAllConfiguredAccount(tableName) {
    return (id, callback) => {
      let connection = mysql.createConnection(dbConfig);
      try {
        connection.connect();
        connection.query(SQL`SELECT * FROM `
            .append(tableName)
            .append(SQL` WHERE team_id=${id}`),
          (err, rows) => {
            callback(err, rows);
          });
      }
      finally {
        connection.end();
      }
    }
  }

  return {
    teams: {
      get: storage.teams.get,
      save: storage.teams.save,
      all: storage.teams.all
    },
    channels: {
      get: storage.channels.get,
      save: storage.channels.save,
      all: storage.channels.all
    },
    users: {
      get: storage.users.get,
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
