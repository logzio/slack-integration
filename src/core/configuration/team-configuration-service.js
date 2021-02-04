const TeamConfiguration = require('./team-configuration');
const LoggerFactory = require('../../core/logging/logger-factory');
const logger = LoggerFactory.getLogger(__filename);
const ApiExtract = require('../utils/apiExtract');
const httpClient = require('../client');
const { storageService } = require('../storage');

class TeamConfigurationService {
  constructor() {
    this.teamStore = storageService.teams;
    this.channelStore = storageService.channels;
    this.accountsStore = storageService.configuredAccounts;
  }

  async getDefault(teamId) {
    logger.info('getDefault teamId:' + teamId);
    const teamDate = await this.teamStore.get_async(teamId);
    if (!teamDate || !teamDate.bot.configuration) {
      logger.info('getDefault 1');
      return new TeamConfiguration();
    } else {
      logger.info(
        'getDefault 2 ' + teamDate.bot.configuration + ', ' + teamDate.name
      );
      return new TeamConfiguration(teamDate.bot.configuration, teamDate.name);
    }
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
    logger.info(
      '---saving---:alias' + teamConfiguration.getAlias() + ',teamId=' + teamId
    );
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
          logger.error(
            'tc:' +
              result +
              ',alias' +
              teamConfiguration.getAlias() +
              ',teamId=' +
              teamId
          );
          throw Error();
        } else {
          logger.info(
            'tc-saved:' +
              result +
              ',alias' +
              teamConfiguration.getAlias() +
              ',teamId=' +
              teamId
          );
          return result;
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

  numberOfAccounts(teamId) {
    return this.accountsStore.all(teamId).then(accounts => {
      return accounts.length;
    });
  }

  async isAccountUsedByChannelId(teamId, channelId) {
    const channels = await this.channelStore.all_async();
    return (
      channels.length > 0 &&
      channels.some(
        channel =>
          channel.id === channelId &&
          channel.team === teamId &&
          channel.alias !== undefined
      )
    );
  }

  getAliasAccountsUsedByChannel(teamId, alias) {
    return this.channelStore.all_async().then(channels => {
      return channels.filter(
        channel => channel.team === teamId && channel.alias === alias
      );
    });
  }

  async doesAliasExist(teamId, alias) {
    const accounts = await this.accountsStore.all(teamId);
    return (
      accounts.length > 0 &&
      accounts.some(
        account => new TeamConfiguration(account).getAlias() === alias
      )
    );
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

  async clearDefaultForChannel(teamId, channelId) {
    const channelSettings = await this.channelStore.get_async(channelId);
    delete channelSettings['alias'];
    return this.channelStore.save(channelSettings);
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

  async clearDefault(teamId) {
    const currentTeamData = await this.teamStore.get_async(teamId);
    delete currentTeamData.bot['configuration'];
    await this.teamStore.save(currentTeamData);
    const updatedTeamData = await this.teamStore.get_async(teamId);
    if (updatedTeamData.bot.configuration !== undefined) {
      throw Error();
    } else {
      return updatedTeamData;
    }
  }

  extractRealName(account) {
    return new Promise((resolve, reject) => {
      if (account.alias === 'my-account') {
        httpClient
          .getRealName(account.apiToken, account.region)
          .then(realName => {
            account.realName = realName.accountName;
            resolve(account);
          })
          .catch(err => {
            reject(err);
          });
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
          map = accounts.map(configuredAccount =>
            this.getAccountSafeView(
              configuredAccount,
              teamId,
              bot,
              defaultAccount
            )
          );
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
        this.getAliasAccountsUsedByChannel(teamId, configuredAccount.alias)
      )
      .then(aliasAccounts =>
        ApiExtract.extractAccountsChannelsWithId(bot, aliasAccounts)
      )
      .then(channels => ({
        accountName: configuredAccount.realName,
        accountAlias: configuredAccount.alias,
        isDefault: defaultAccount.config.alias === configuredAccount.alias,
        channels: channels
      }))
      .catch(err => {
        logger.error(
          'getAccountSafeView failed for configuredAccount=' +
            configuredAccount,
          err
        );
      });
  }
}

module.exports = TeamConfigurationService;
