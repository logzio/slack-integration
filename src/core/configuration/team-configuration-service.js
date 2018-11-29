const TeamConfiguration = require('./team-configuration');
const LoggerFactory = require('../../core/logging/logger-factory');
const logger = LoggerFactory.getLogger(__filename);

const makeid = (numberOfChars) => {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < numberOfChars; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text
};


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

  clearDefaultForChannel(teamId, channelId){
    return this.storage.channels.get(channelId).then(channelSettings => {
      delete channelSettings['alias'];
      return this.storage.channels.save(channelSettings);
    })
  }

  extractDefaultFromOldAccount(teamId, httpClient) {
    let storage = this.storage;
    let defaultForTeam = storage.getDefault(teamId);
    let isAccountConfigured = storage.configuredAccounts.all(teamId).some(account => account.getLogzioApiToken() === defaultForTeam.getLogzioApiToken() && account.getLogzioAccountRegion() === defaultForTeam.getLogzioAccountRegion());
    if (defaultForTeam && !isAccountConfigured) storage.configuredAccounts.save({
      team_id: teamId,
      alias: "default-" + makeid(5),
      token: defaultForTeam.getLogzioApiToken(),
      region: defaultForTeam.getLogzioAccountRegion(),
      real_name: httpClient.getRealName(defaultForTeam.getLogzioApiToken(), defaultForTeam.getLogzioAccountRegion())
    });
  }

  setDefault(teamId, alias, httpClient) {
    let storage = this.storage;
    let accountToConfigure = storage.configuredAccounts.get(teamId, alias);
    if (!accountToConfigure) return;
    this.extractDefaultFromOldAccount(teamId, httpClient);
    return storage.saveDefault(teamId, accountToConfigure)
  }

  clearDefault(teamId, httpClient) {
    let storage = this.storage;
    this.extractDefaultFromOldAccount(teamId, httpClient);
    return storage.teams.get(teamId).then(teamAccount => {
      return storage.teams.save({
        ...teamAccount,
        bot : {}
      });
    });
  }

  getAllAccountsSafeView(teamId) {
    return this.storage.configuredAccounts.all(teamId).then(accounts => {
      return accounts.map(configuredAccount => ({
        accountName: configuredAccount.getRealName(),
        accountAlias: configuredAccount.getAlias()
      }));
    }).catch(err => {
      logger.info(err);
      return [];
    });
  }
}

module.exports = TeamConfigurationService;
