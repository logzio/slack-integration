const HttpMethod = require('../../core/client/http-method');
const LoggerFactory = require('../../core/logging/logger-factory');
const TeamConfiguration = require('../../core/configuration/team-configuration');
const { getEventMetadata } = require('../../core/logging/logging-metadata');
const { sendUsage } = require('../../help/usage-message-supplier');

const logger = LoggerFactory.getLogger(__filename);

class removeAccountHandler {
  constructor(teamConfigService, httpClient){
    this.teamConfigService = teamConfigService;
    this.httpClient = httpClient;
  }

  removeAccount(teamId, alias) {
    let confService = this.teamConfigService;
    confService.removeAccount(teamId, alias)
  }

}


module.exports(removeAccountHandler);
