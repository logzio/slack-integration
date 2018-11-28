const LoggerFactory = require('../../core/logging/logger-factory');

const logger = LoggerFactory.getLogger(__filename);

const makeid = (numberOfChars) => {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < numberOfChars; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text
};

class DefaultHandler {

  constructor(storage, httpClient) {
    this.storage = storage;
    this.httpClient = httpClient;
  }

  setDefault(teamId, alias) {
    let storage = this.storage;
    let accountToConfigure = storage.configuredAccounts.get(teamId, alias);
    if (!accountToConfigure) return;
    this.extractDefaultFromOldAccount(storage, teamId);
    return storage.saveDefault(teamId, accountToConfigure)
  }

  extractDefaultFromOldAccount(storage, teamId) {
    let defaultForTeam = storage.getDefault(teamId);
    let isAccountConfigured = storage.configuredAccounts.all(teamId).some(account => account.getLogzioApiToken() === defaultForTeam.getLogzioApiToken() && account.getLogzioAccountRegion() === defaultForTeam.getLogzioAccountRegion());
    if (defaultForTeam && !isAccountConfigured) storage.configuredAccounts.save({
      team_id: teamId,
      alias: "default-" + makeid(5),
      token: defaultForTeam.getLogzioApiToken(),
      region: defaultForTeam.getLogzioAccountRegion(),
      real_name: this.httpClient.getRealName(defaultForTeam.getLogzioApiToken(), defaultForTeam.getLogzioAccountRegion())
    });
  }

  clearDefault(teamId) {
    let storage = this.storage;
    this.extractDefaultFromOldAccount(storage, teamId);
    return storage.teams.get(teamId).then(teamAccount => {
      return storage.teams.save({
        ...teamAccount,
        bot : {}
      });
    });
  }
}

module.exports(DefaultHandler);
