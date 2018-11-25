const TeamConfiguration = require('./team-configuration');

class TeamConfigurationService {

  constructor(storage) {
    this.teamStore = storage.teams;
    this.storage = storage;
  }

  getDefault(teamId) {
    return this.teamStore.get(teamId)
      .then(teamDate => {
        if (!teamDate || !teamDate.bot.configuration) {
          return new TeamConfiguration();
        } else {
          return new TeamConfiguration(teamDate.bot.configuration);
        }
      });
  }

  saveDefault(teamId, teamConfiguration) {
    const teamStore = this.teamStore;
    return teamStore.get(teamId)
      .then(currentTeamData => {
        const { bot } = currentTeamData;
        const updatedTeamData = {
          ...currentTeamData,
          bot: {
            ...bot,
            configuration: teamConfiguration.getAsObject(),
          }
        };

        return teamStore.saveDefault(updatedTeamData);
      });
  }

  saveAccountForChannel(channelId, alias){
    const storage = this.storage;
    return storage.channels.get(channelId)
      .then(currentChannelData => {
        return storage.channels.save({
          ...currentChannelData,
          alias: alias
        })
      })
  }

  getAccountForChannel(teamId, channelId){
    const storage = this.storage;
    let channelConfiguredAccountAlias = storage.channels.get(channelId).alias;
    if (channelConfiguredAccountAlias){
      let configuredAccount = storage.configuredAccounts.get(teamId, channelConfiguredAccountAlias);
      return !configuredAccount ?
        new TeamConfiguration() :
        new TeamConfiguration()
          .setLogzioApiToken(configuredAccount.token)
          .setLogzioAccountRegion(configuredAccount.region)
          .setAlias(configuredAccount.alias)
          .setRealName(configuredAccount.real_name);
    }
  }

}

module.exports = TeamConfigurationService;
