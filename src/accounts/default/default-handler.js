class DefaultHandler {

  constructor(teamConfigService, httpClient) {
    this.teamConfigService = teamConfigService;
    this.httpClient = httpClient;
  }

  setDefault(teamId, alias) {
    this.teamConfigService.setDefault(teamId, alias, this.httpClient)
  }

  clearDefault(teamId) {
    this.teamConfigService.clearDefault(teamId, this.httpClient)
  }
}

module.exports = DefaultHandler;
