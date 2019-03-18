const TeamConfiguration = require('./team-configuration');
const LoggerFactory = require('../../core/logging/logger-factory');
const logger = LoggerFactory.getLogger(__filename);
const ApiExtract = require('../utils/apiExtract');

class TeamConfigurationService {
  constructor(storage ,httpClient) {
    this.teamStore = storage.teams;
    this.channelStore = storage.channels;
    this.accountsStore = storage.configuredAccounts;
    this.httpClient = httpClient;
  }
  getDefault(teamId) {
    return this.teamStore.get_async(teamId).then(teamDate => {
      if (!teamDate || !teamDate.bot.configuration) {
        return new TeamConfiguration();
      } else {
        return new TeamConfiguration(teamDate.bot.configuration, teamDate.name);
      }
    });
  }

  saveDefault(teamId, teamConfiguration) {
    return this.teamStore
      .get_async(teamId)
      .then(currentTeamData => {
        const { bot } = currentTeamData;
        const updatedTeamData = {
          ...currentTeamData,
          bot: {
            ...bot,
            configuration: teamConfiguration.getAsObject()
          }
        };
        return updatedTeamData;
      })
      .then(updatedTeamData => {
        return this.teamStore.save(updatedTeamData);
      })
      .then(() => {
        return this.getDefault(teamId);
      })
      .then(defaultTeam => {
        if (defaultTeam.config.alias !== teamConfiguration.config.alias) {
          throw Error();
        }
        return true;
      });
  }

  saveAccountForChannel(teamId, channelId, alias) {
    return this.channelStore.save({
      id: channelId,
      alias: alias,
      team: teamId
    });
  }

  getAccountForChannel(teamId, channelId) {
    return this.channelStore
      .get_async(channelId)
      .then(channelConfiguredAccountAlias => {
        if (channelConfiguredAccountAlias)
          return this.accountsStore
            .get(teamId, channelConfiguredAccountAlias.alias)
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
            });
      });
  }

  getAccountForAlias(alias, teamId) {
    return this.accountsStore.get(teamId, alias);
  }

  addAccount(teamId, teamConfiguration) {
    return this.accountsStore
      .save({
        team_id: teamId,
        alias: teamConfiguration.getAlias(),
        region: teamConfiguration.getLogzioAccountRegion(),
        apiToken: teamConfiguration.getLogzioApiToken(),
        realName: teamConfiguration.getRealName()
      })
      .then(() => this.getAccountForAlias(teamConfiguration.getAlias(), teamId))
      .then(result => {
        if (!result) {
          throw Error();
        }
      });
  }

  removeChannel(teamId, alias) {
    return this.channelStore
      .all_async()
      .then(channels => {
        const filterdChannels = channels
          .filter(channel => channel.team === teamId && channel.alias === alias)
          .map(channel => {
            delete channel['alias'];
            return channel;
          });

        const PromiseList = filterdChannels.map(channel =>
          this.channelStore.save(channel)
        );
        return Promise.all(PromiseList);
      })
      .then(() => {
        return this.isAccountUsedByChannel(teamId, alias);
      });
  }
  removeConfiguredAccount(teamId, alias) {
    return this.accountsStore
      .delete(teamId, alias)
      .then(() => {
        return this.accountsStore.get(teamId, alias);
      })
      .then(configuredAccount =>
        configuredAccount === undefined ? true : false
      );
  }

  removeDefaultAccount(teamId, alias) {
    return this.removeAccount(teamId, alias).then(removedConfiguredAccount =>
      removedConfiguredAccount ? this.clearDefault(teamId) : false
    );
  }

  removeAccount(teamId, alias) {
    return this.removeChannel(teamId, alias).then(hasChannels =>
      hasChannels ? false : this.removeConfiguredAccount(teamId, alias)
    );
  }

  isAccountUsedByChannel(teamId, alias) {
    return this.channelStore.all_async().then(channels => {
      return (
        channels.length > 0 &&
        channels.some(
          channel => channel.alias === alias && channel.team === teamId
        )
      );
    });
  }

  isAccountUsedByChannelId(teamId, channelId) {
    return this.channelStore.all_async().then(channels => {
      return (
        channels.length > 0 &&
        channels.some(
          channel =>
            channel.id === channelId &&
            channel.team === teamId &&
            channel.alias !== undefined
        )
      );
    });
  }

  getAliasAccountsUsedByChannel(teamId, alias) {
    return this.channelStore.all_async().then(channels => {
      return channels.filter(
        channel => channel.team === teamId && channel.alias === alias
      );
    });
  }

  doesAliasExist(teamId, alias) {
    return this.accountsStore.all(teamId).then(accounts => {
      return (
        accounts.length > 0 &&
        accounts.some(
          account => new TeamConfiguration(account).getAlias() === alias
        )
      );
    });
  }

  getOrDefault(alias, teamId, channelId) {
    if (alias !== undefined && alias !== null) {
      let accountForAlias = this.getAccountForAlias(alias, teamId).then(
        result => {
          let config = new TeamConfiguration()
            .setLogzioApiToken(result.apiToken)
            .setLogzioAccountRegion(result.region)
            .setAlias(alias);
          return config;
        }
      );
      return accountForAlias;
    }

    return this.getAccountForChannel(teamId, channelId)
      .then(channelAccount => {
        if (channelAccount === null || channelAccount === undefined) {
          return this.getDefault(teamId);
        } else {
          return channelAccount;
        }
      })
      .catch(err => {
        logger.error(err);
        return new TeamConfiguration();
      });
  }

  clearDefaultForChannel(teamId, channelId) {
    return this.channelStore.get_async(channelId).then(channelSettings => {
      delete channelSettings['alias'];
      return this.channelStore.save(channelSettings);
    });
  }

  setDefault(teamId, alias) {
    return this.accountsStore
      .get(teamId, alias)
      .then(accountToConfigure => {
        if (!accountToConfigure) return false;
        return new TeamConfiguration(accountToConfigure)
          .setLogzioApiToken(accountToConfigure.apiToken)
          .setLogzioAccountRegion(accountToConfigure.region)
          .setAlias(accountToConfigure.alias);
      })
      .then(teamConfiguration => this.saveDefault(teamId, teamConfiguration));
  }

  clearDefault(teamId) {
    return this.teamStore.get_async(teamId).then(currentTeamData => {
      delete currentTeamData.bot['configuration'];
      return this.teamStore
        .save(currentTeamData)
        .then(() => this.teamStore.get_async(teamId))
        .then(currentTeamData => {
          if (currentTeamData.bot.configuration !== undefined) {
            throw Error();
          } else {
            return currentTeamData;
          }
        });
    });
  }

  extractRealName(account) {
    return new Promise(resolve => {
      if (account.alias === 'my-account') {
        this.httpClient.getRealName(account.apiToken,account.region)
          .then(realName => {
            account.realName = realName.accountName;
            resolve(account);
          })
      } else {
        resolve(account);
      }
    });
  }

  async getAllAccountsSafeView(teamId, bot) {
    const defaultAccount = await this.getDefault(teamId);
    return this.accountsStore
      .all(teamId)
      .then(accounts => {
        let map;

        if (accounts.length === 0 && defaultAccount.getAlias()) {
          map = {};
          map['default'] = {
            accountName: defaultAccount.realName,
            accountAlias: 'no alias',
            isDefault: true,
            channels: []
          };
        } else {
          map = accounts.map(configuredAccount => this.getAccountSafeView(configuredAccount, teamId, bot, defaultAccount));
        }
        return Promise.all(map);
      })

      .catch(err => {
        logger.info(err);
        return [];
      });
  }

  getAccountSafeView(configuredAccount, teamId, bot, defaultAccount) {
    return this.extractRealName(configuredAccount)
      .then(configuredAccount =>
        this.getAliasAccountsUsedByChannel(teamId, configuredAccount.alias))
      .then(aliasAccounts =>
        ApiExtract.extractAccountsChannelsWithId(bot, aliasAccounts)
      )
      .then(channels => ({
        accountName: configuredAccount.realName,
        accountAlias: configuredAccount.alias,
        isDefault:
          defaultAccount.config.alias === configuredAccount.alias,
        channels: channels,
      }));
  }
}

module.exports = TeamConfigurationService;
