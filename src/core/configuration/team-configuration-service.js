const TeamConfiguration = require('./team-configuration');
const LoggerFactory = require('../../core/logging/logger-factory');
const logger = LoggerFactory.getLogger(__filename);
const ApiExtract = require('../utils/apiExtract');

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
     return  this.storage.teams.get_async(teamId)
        .then(teamDate => {
          if (!teamDate || !teamDate.bot.configuration) {
            return new TeamConfiguration();
          } else {
            return new TeamConfiguration(teamDate.bot.configuration);
          }
        })
        .catch(err=>{
          const r = 8;
        })
  }

  saveDefault(teamId, teamConfiguration) {
    return this.teamStore.get_async(teamId)
      .then(currentTeamData => {
        const {bot} = currentTeamData;
        const updatedTeamData = {
          ...currentTeamData,
          bot: {
            ...bot,
            configuration: teamConfiguration.getAsObject(),
          }
        };
        return updatedTeamData;
      })
      .then(updatedTeamData => {

        return this.teamStore.save(updatedTeamData);
      })
      .then((data) =>
      {
        return this.getDefault(teamId)
      })
      .then(defaultTeam => {
            if (defaultTeam.config.alias !== teamConfiguration.config.alias) {
              throw Error();
            }
            return true;
        })
      ;
  }

  saveAccountForChannel(teamId, channelId, alias) {
    const storage = this.storage;
    return storage.channels.save({
          id: channelId,
          alias: alias,
          team: teamId
      });
  }

  getAccountForChannel(teamId, channelId) {
    return this.storage.channels.get_async(channelId)
      .then(channelConfiguredAccountAlias => {
        if (
          channelConfiguredAccountAlias)
          return this.storage.configuredAccounts.get(teamId, channelConfiguredAccountAlias.alias)
            .then(configuredAccount => {
                if (!configuredAccount) {
                  return null;
                } else {
                  return new TeamConfiguration()
                    .setLogzioApiToken(configuredAccount.apiToken)
                    .setLogzioAccountRegion(configuredAccount.region)
                    .setAlias(configuredAccount.alias)
                    .setRealName(configuredAccount.realName);
                }
              }
            );

      })
  }

  getAccountForAlias(alias, teamId) {
    return this.storage.configuredAccounts.get(teamId,alias);
  }

  addAccount(teamId, teamConfiguration) {
    const storage = this.storage.configuredAccounts;
    return storage.save({
        team_id: teamId,
        alias: teamConfiguration.getAlias(),
        region: teamConfiguration.getLogzioAccountRegion(),
        apiToken: teamConfiguration.getLogzioApiToken(),
        realName: teamConfiguration.getRealName()
      });
  }

  removeChannel(teamId, alias) {
    return this.storage.channels.all_async()
      .then(channels => {
        channels.filter(channel => channel.team === teamId && channel.alias === alias).forEach(channel => {
          delete channel['alias'];
          channels.save(channel);
        });
      })
      .then(() => {
        return this.isAccountUsedByChannel(teamId, alias)
      })
  }


  removeConfiguredAccount(teamId, alias) {
    return this.storage.configuredAccounts.delete(teamId, alias)
      .then(()=>{
        return this.storage.configuredAccounts.get(teamId, alias)})
      .then(configuredAccount =>
          configuredAccount === undefined?true:false)
  }

  removeDefaultAccount(teamId, alias) {
    return this.removeAccount(teamId, alias)
      .then(removedConfiguredAccount=>
        removedConfiguredAccount? this.clearDefault(teamId):false)
  }

  removeAccount(teamId, alias) {
    return this.removeChannel(teamId, alias)
      .then(hasChannels =>
        hasChannels?false:this.removeConfiguredAccount(teamId, alias))
  }


  isAccountUsedByChannel(teamId, alias) {
    return this.storage.channels.all_async()
      .then((channels)=> {
        return channels.length >0 && channels.some(channel =>
          channel.alias === alias && channel.team === teamId);
      })
  }

  isAccountUsedByChannelId(teamId, channelId) {
    return this.storage.channels.all_async()
      .then((channels)=> {
        return channels.length >0 && channels.some(channel =>
          channel.id === channelId && channel.team === teamId && channel.alias!==undefined);
      })
  }


  getAliasAccountsUsedByChannel(teamId, alias){
    return this.storage.channels.all_async()
      .then(channels => {
        return channels.filter(channel =>
          channel.team === teamId && channel.alias === alias);
      })
  }

  doesAliasExist(teamId, alias) {
    return this.storage.configuredAccounts.all(teamId)
      .then((accounts) => {
        return accounts.length> 0 && accounts.some(
          account =>
            (new TeamConfiguration(account)).getAlias() === alias)
      })
  }

  getOrDefault(alias,teamId, channelId) {
    if(alias!==undefined && alias!==null){
      let accountForAlias = this.getAccountForAlias(alias, teamId)
        .then(result=>
        {
          let config = new TeamConfiguration()
              .setLogzioApiToken(result.apiToken)
              .setLogzioAccountRegion(result.region)
              .setAlias(alias)
          return config;
        })
      return accountForAlias;
    }

    return this.getAccountForChannel(teamId, channelId)
      .then(channelAccount => {
        if (channelAccount === null || channelAccount === undefined) {
          return this.getDefault(teamId);
        }else{
          return channelAccount;
        }

      }).catch(err => {
      logger.error(err);
      return new TeamConfiguration();
    })
  }

  clearDefaultForChannel(teamId, channelId){
    return this.storage.channels.get_async(channelId).then(channelSettings => {
      delete channelSettings['alias'];
      return this.storage.channels.save(channelSettings);
    })
  }

  extractDefaultFromOldAccount(teamId, httpClient) {
    let storage = this.storage;
    let defaultForTeam = this.getDefault(teamId);
    return storage.configuredAccounts.all(teamId)
      .then(isAccountConfigured => {
        isAccountConfigured.some(account => account.getLogzioApiToken() === defaultForTeam.getLogzioApiToken() && account.getLogzioAccountRegion() === defaultForTeam.getLogzioAccountRegion());

        if (defaultForTeam && !isAccountConfigured) storage.configuredAccounts.save({
          team_id: teamId,
          alias: "default-" + makeid(5),
          apiToken: defaultForTeam.getLogzioApiToken(),
          region: defaultForTeam.getLogzioAccountRegion(),
          realName: httpClient.getRealName(defaultForTeam.getLogzioApiToken(), defaultForTeam.getLogzioAccountRegion())
        });
      });
  }

  setDefault(teamId, alias, httpClient) {
   return this.storage.configuredAccounts.get(teamId, alias)
      .then(accountToConfigure=>{
        if (!accountToConfigure)
          return false;
        this.extractDefaultFromOldAccount(teamId, httpClient);
        return new TeamConfiguration(accountToConfigure)
          .setLogzioApiToken(accountToConfigure.apiToken)
          .setLogzioAccountRegion(accountToConfigure.region)
          .setAlias(accountToConfigure.alias)
          ;
      })
      .then(teamConfiguration=> this.saveDefault(teamId, teamConfiguration))
  }

  clearDefault(teamId) {
        return this.teamStore.get_async(teamId)
          .then(currentTeamData => {
            delete currentTeamData.bot['configuration'];
            return this.teamStore.save(currentTeamData)
              .then(() =>
                this.teamStore.get_async(teamId))
              .then(currentTeamData => {
                if (currentTeamData.bot.configuration !== undefined) {
                  throw Error()
                }else{
                  return currentTeamData;
                }
              })
          })
  }

  async getAllAccountsSafeView(teamId, bot) {
    const defaultAccount = await this.getDefault(teamId);
    return this.storage.configuredAccounts.all(teamId)
      .then(accounts => {
        let map = accounts.map(configuredAccount =>
          this.getAliasAccountsUsedByChannel(teamId, configuredAccount.alias)
            .then(aliasAccounts =>
              ApiExtract.extractAccountsChannelsWithId(bot, aliasAccounts))
            .then(channels =>
              ({
                accountName: configuredAccount.realName,
                accountAlias: configuredAccount.alias,
                isDefault: defaultAccount.config.alias === configuredAccount.alias,
                channels: channels
              })
            )
        )
        return Promise.all(map)
      })
      .catch(err => {
        logger.info(err);
        return [];
      });
  }
}

module.exports = TeamConfigurationService;
