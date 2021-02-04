const HttpClient = require('../../core/client/http-client');
const { teamConfigurationService } = require('../../core/configuration');

class ChannelAccountHandler {
  async setDefault(teamId, channelId, alias) {
    await HttpClient.validateAlias(teamId, alias);
    await teamConfigurationService.saveAccountForChannel(
      teamId,
      channelId,
      alias
    );
  }

  clearDefault(teamId, channelId) {
    return teamConfigurationService.clearDefaultForChannel(teamId, channelId);
  }

  isAccountUsedByChannel(teamId, channelId) {
    return teamConfigurationService.isAccountUsedByChannelId(teamId, channelId);
  }
}

module.exports = ChannelAccountHandler;
