class TeamConfiguration {

  constructor(config) {
    this.config = config || {};
  }

  getLogzioAccountRegion() {
    return this.config['accountRegion'];
  }

  setLogzioAccountRegion(logzioAccountRegion) {
    this.config = { ...this.config, accountRegion: logzioAccountRegion };
    return this;
  }

  getLogzioApiToken() {
    return this.config['apiToken'];
  }

  setLogzioApiToken(logzioApiToken) {
    this.config = { ...this.config, apiToken: logzioApiToken };
    return this;
  }

  getAsObject() {
    return this.config;
  }

}

module.exports = TeamConfiguration;
