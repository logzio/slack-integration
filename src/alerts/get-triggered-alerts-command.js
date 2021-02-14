const Command = require('../core/commands/command');
const LoggerFactory = require('../core/logging/logger-factory');
const moment = require('moment');
const { getEventMetadata } = require('../core/logging/logging-metadata');
const Messages = require('../core/messages/messages');

const logger = LoggerFactory.getLogger(__filename);

const colors = {
  low: '#89C182',
  medium: '#FFA13D',
  high: '#FF4756'
};

const commandWithAlias = /(.+) (get|list) triggered alerts/;
const command = /(get|list) triggered alerts/;
const events = 'direct_message,direct_mention';

function createTriggeredAlertsMessage(events, total, alias) {
  const attachments = events.map(({ eventDate, name, severity }) => {
    return {
      color: colors[severity.toLowerCase()],
      footer: moment.unix(eventDate).fromNow(),
      title: name
    };
  });

  const aliasResults = Messages.getResults(alias);
  return {
    text: `${aliasResults}Displaying ${events.length} out of ${total} events`,
    attachments
  };
}

class GetTriggeredAlertsCommand extends Command {
  constructor(alertsClient) {
    super();
    this.alertsClient = alertsClient;
    this.teamConfigurationService =
      alertsClient.httpClient.teamConfigurationService;
  }

  configure(controller) {
    controller.hears([commandWithAlias], events, (bot, message) => {
      this.teamConfigurationService
        .getCompanyNameForTeamId(message.team)
        .then(companyName => {
          this.getTriggeredAlerts(null, bot, message, true, companyName);
        });
    });
    controller.hears([command], events, (bot, message) => {
      this.teamConfigurationService
        .getCompanyNameForTeamId(message.team)
        .then(companyName => {
          this.getTriggeredAlerts(
            message.channel,
            bot,
            message,
            null,
            false,
            companyName
          );
        });
    });
  }

  getTriggeredAlerts(channel, bot, message, withAlias, companyName) {
    logger.info(
      `User ${message.user} from team ${message.team}, customer name ${companyName} requested triggered alerts list`,
      getEventMetadata(message, 'get-triggered-alerts', companyName)
    );
    let alias;
    const matches = message.match;
    if (withAlias) {
      alias = matches[1];
    }
    this.alertsClient
      .getTriggeredAlerts(
        alias,
        channel,
        message.team,
        5,
        ['HIGH', 'MEDIUM', 'LOW'],
        'DATE',
        'DESC'
      )
      .then(({ results, total, alias }) => {
        bot.reply(message, createTriggeredAlertsMessage(results, total, alias));
      })
      .catch(err => {
        this.handleError(
          bot,
          message,
          err,
          err => {
            logger.warn(
              'Failed to get triggered events',
              err,
              getEventMetadata(message, 'failed-to-get-triggered-alerts')
            );
          },
          true
        );
      });
  }

  getCategory() {
    return 'alert';
  }

  getUsage() {
    return ['*[&lt;alias&gt;] get triggered alerts* - List triggered alerts'];
  }
}

module.exports = GetTriggeredAlertsCommand;
