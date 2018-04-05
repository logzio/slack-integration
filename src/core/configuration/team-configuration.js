class TeamConfiguration {

  constructor(config) {
    this.config = config || {};
  }

  getLogzioAccountRegion() {
    return this.config['accountRegion'];
  }

  setLogzioAccountRegion(logzioAccountRegion) {
    this.config = { ...config, accountRegion: logzioAccountRegion };
  }

  getLogzioApiToken() {
    return this.config['apiToken'];
  }

  setLogzioApiToken(logzioApiToken) {
    this.config = { ...config, apiToken: logzioApiToken };
  }

  getAsObject() {
    return this.config;
  }

}

module.exports = TeamConfiguration;
