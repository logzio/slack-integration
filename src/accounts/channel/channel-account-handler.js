class ChannelAccountHandler {
  constructor(teamConfService) {
    this.teamConfService = teamConfService;
  }

  setDefault(teamId, channelId, alias) {
    return this.teamConfService.saveAccountForChannel(channelId, alias, teamId);
  }

  clearDefault(teamId, channelId){
    return this.teamConfService.clearDefaultForChannel(teamId, channelId)
  }
}

module.exports = ChannelAccountHandler;
