const HttpClient = require('../../core/client/http-client');

class ChannelAccountHandler {
  constructor(teamConfService) {
    this.teamConfService = teamConfService;
  }

  setDefault(teamId, channelId, alias) {
    return HttpClient.validateAlias(this.teamConfService, teamId, alias)
      .then(() =>
        this.teamConfService.saveAccountForChannel(teamId, channelId, alias)
      )
      .then(() => true);

    // return  this.teamConfService.doesAliasExist(teamId, alias)
    //   .then(accountExist => {
    //   if (accountExist) {
    //
    //
    //     return this.teamConfService.saveAccountForChannel(teamId, channelId, alias).then(() => true);
    //   } else {
    //     return false;
    //   }
    // });
  }

  clearDefault(teamId, channelId) {
    return this.teamConfService.clearDefaultForChannel(teamId, channelId);
  }

  isAccountUsedByChannel(teamId, channelId) {
    return this.teamConfService.isAccountUsedByChannelId(teamId, channelId);
  }
}

module.exports = ChannelAccountHandler;
