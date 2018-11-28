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

  saveAccountForChannel(channelId, alias, teamId) {
    const storage = this.storage;
    return storage.channels.get(channelId)
      .then(currentChannelData => {
        return storage.channels.save({
          ...currentChannelData,
          alias: alias,
          team: teamId
        })
      })
  }

  getAccountForChannel(teamId, channelId) {
    const storage = this.storage;
    let channelConfiguredAccountAlias = storage.channels.get(channelId).alias;
    if (channelConfiguredAccountAlias){
      let configuredAccount = storage.configuredAccounts.get(teamId, channelConfiguredAccountAlias);
      return !configuredAccount ?
        null :
        new TeamConfiguration()
          .setLogzioApiToken(configuredAccount.token)
          .setLogzioAccountRegion(configuredAccount.region)
          .setAlias(configuredAccount.alias)
          .setRealName(configuredAccount.real_name);
    }
  }

  addAccount(teamId, teamConfiguration) {
    const storage = this.storage.configuredAccounts;
    return storage.save({
        team_id: teamId,
        alias: teamConfiguration.getAlias(),
        region: teamConfiguration.getLogzioAccountRegion(),
        token: teamConfiguration.getLogzioApiToken(),
        real_name: teamConfiguration.getRealName()
      });
  }

  removeAccount(teamId, alias) {
    const storage = this.storage.configuredAccounts;
    const channels = this.storage.channels;
    channels.all().filter(channel => channel.team === teamId && channel.alias === alias).forEach(channel => {
      delete channel['alias'];
      channels.save(channel);
    });
    return this.isAccountUsedByChannel(teamId, alias) ? () => false : storage.delete(teamId, alias);
  }

  isAccountUsedByChannel(teamId, alias) {
    return this.storage.channels.all().some(channel => channel.alias === alias && channel.teamId === teamId);
  }

  getOrDefault(teamId, channelId) {
    let channelAccount = this.getAccountForChannel(teamId, channelId);
    return channelAccount == null ? this.getDefault(teamId) : channelAccount;
  }
}

module.exports = TeamConfigurationService;
