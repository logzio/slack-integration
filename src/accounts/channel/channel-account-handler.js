class ChannelAccountHandler {
  constructor(storage, teamConfService) {
    this.storage = storage;
    this.teamConfService = teamConfService;
  }

  setDefault(teamId, channelId, alias) {
    return this.teamConfService.saveAccountForChannel(channelId, alias, teamId);
  }

  clearDefault(teamId, channelId){
    return this.storage.channels.get(channelId).then(channelSettings => {
      delete channelSettings['alias'];
      return this.storage.channels.save(channelSettings);
    })
  }
}

module.exports(ChannelAccountHandler);
