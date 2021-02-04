const HttpClient = require('../../core/client/http-client');
const { httpClient } = require('../../core/client');
const { teamConfigurationService } = require('../../core/configuration');

class DefaultHandler {
  async setDefault(teamId, alias) {
    const isValid = await HttpClient.validateAlias(
      teamId,
      alias
    );
    if (isValid) {
      return teamConfigurationService.setDefault(teamId, alias, httpClient);
    }
    return false;
  }

  async clearDefault(teamId) {
    const configuration = await teamConfigurationService.getDefault(teamId);
    await HttpClient.validateConfiguration(configuration);
    await teamConfigurationService.clearDefault(teamId);
  }
}

module.exports = DefaultHandler;
