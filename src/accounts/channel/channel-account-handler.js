class ChannelAccountHandler {
  constructor(teamConfService) {
    this.teamConfService = teamConfService;
  }

  setDefault(teamId, channelId, alias) {
    return this.teamConfService.doesAliasExist(teamId, alias).then(accountExist => {
      if (accountExist) {
        return this.teamConfService.saveAccountForChannel(channelId, alias, teamId).then(() => true);
      } else {
        return () => false;
      }
    });
  }

  clearDefault(teamId, channelId){
    return this.teamConfService.clearDefaultForChannel(teamId, channelId)
  }
}

module.exports = ChannelAccountHandler;
