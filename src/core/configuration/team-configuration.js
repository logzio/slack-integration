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

  getAlias() {
    return this.config['alias'];
  }

  setAlias(alias) {
    this.config = { ...this.config, alias: alias};
    return this;
  }

  getRealName() {
    return this.config['realName'];
  }

  setRealName(realName) {
    this.config = { ...this.config, realName: realName};
    return this;
  }

  getAsObject() {
    return this.config;
  }

}

module.exports = TeamConfiguration;
