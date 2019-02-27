const HttpClient = require('../../core/client/http-client');

class DefaultHandler {
  constructor(teamConfigService, httpClient) {
    this.teamConfigService = teamConfigService;
    this.httpClient = httpClient;
  }

  setDefault(teamId, alias) {
    return HttpClient.validateAlias(this.teamConfigService, teamId, alias).then(
      isValid => {
        if (isValid) {
          return this.teamConfigService.setDefault(
            teamId,
            alias,
            this.httpClient
          );
        }
        return false;
      }
    );
  }

  clearDefault(teamId) {
    return this.teamConfigService
      .getDefault(teamId)
      .then(configuration => HttpClient.validateConfiguration(configuration))
      .then(this.teamConfigService.clearDefault(teamId, this.httpClient));
  }
}

module.exports = DefaultHandler;
