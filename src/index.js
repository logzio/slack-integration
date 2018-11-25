const LogzStorageMySQL = require('./core/storage/logzio-storage');
const DBMigrate = require('db-migrate');
const LogzioBot = require('./logzio-bot');

function getRequiredValueFromEnv(variableName) {
  const value = process.env[variableName];
  if (!value) {
    throw new Error(`Missing required environment variable '${variableName}'`);
  }

  return value;
}

function migrateDatabase(dbConfig) {
  const options = {
    throwUncatched: true,
    env: 'prod',
    config: {
      prod: {
        ...dbConfig,
        driver: 'mysql'
      }
    }
  };

  return DBMigrate.getInstance(true, options).up();
}

const dbConfig = {
  user: getRequiredValueFromEnv('MYSQL_USER'),
  password: getRequiredValueFromEnv('MYSQL_PASSWORD'),
  database: getRequiredValueFromEnv('MYSQL_DATABASE'),
  host: getRequiredValueFromEnv('MYSQL_HOST'),
};

migrateDatabase(dbConfig).then(() => {
  const apiConfig = require('../conf/api');
  const externalDomain = getRequiredValueFromEnv('EXTERNAL_DOMAIN');
  const storage = new LogzStorageMySQL(dbConfig);

  const logzioBot = new LogzioBot(apiConfig, externalDomain, storage);
  logzioBot.bootstrap(
    getRequiredValueFromEnv('CLIENT_ID'),
    getRequiredValueFromEnv('CLIENT_SECRET'),
    getRequiredValueFromEnv('VERIFICATION_TOKEN'),
    getRequiredValueFromEnv('PORT'),
  );
});
