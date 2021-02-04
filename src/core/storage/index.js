const { dbConfig } = require('../../db-config');
const LogzStorageMySQL = require('./logzio-storage');

const storageService = new LogzStorageMySQL(dbConfig);

module.exports = { storageService };
