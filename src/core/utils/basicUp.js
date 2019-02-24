const DBMigrate = require('db-migrate');
class BasicUp {

  static getRequiredValueFromEnv(variableName) {
    const value = process.env[variableName];
    if (!value) {
      throw new Error(`Missing required environment variable '${variableName}'`);
    }
    return value;
  }

  static migrateDatabase(dbConfig) {
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
}

module.exports = BasicUp;
