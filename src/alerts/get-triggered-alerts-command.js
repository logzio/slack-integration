const Command = require('../core/commands/command');
const LoggerFactory = require('../core/logging/logger-factory');
const moment = require('moment');
const { getEventMetadata } = require('../core/logging/logging-metadata');

const logger = LoggerFactory.getLogger(__filename);

const colors = {
  low: '#89C182',
  medium: '#FFA13D',
  high: '#FF4756',
};

function createTriggeredAlertsMessage(events, total) {
  const attachments = events.map(({ eventDate, name, severity }) => {
    return {
      color: colors[severity.toLowerCase()],
      footer: moment.unix(eventDate).fromNow(),
      title: name,
    };
  });

  return {
    text: `Displaying ${events.length} out of ${total} events`,
    attachments
  };
}

class GetTriggeredAlertsCommand extends Command {

  constructor(alertsClient) {
    super();
    this.alertsClient = alertsClient;
  }
  configure(controller) {
    const alertsClient = this.alertsClient;
    controller.hears([/(get|list) triggered alerts/], 'direct_message,direct_mention', function (bot, message) {
      alertsClient.getTriggeredAlerts(message.team, 5, ["HIGH", "MEDIUM", "LOW"], "DATE", "DESC")
        .then(({ results, total }) => bot.reply(message, createTriggeredAlertsMessage(results, total)))
        .catch(err => {
          logger.warn('Failed to get triggered events', err, getEventMetadata(message, 'failed-to-get-triggered-alerts'));
          bot.reply(message, 'Failed to get triggered events');
        });
    })
  }

  getCategory() {
    return 'alert';
  }

  getUsage() {
    return [
      '*get triggered alerts* - Lists triggered alerts',
    ];
  }

}

module.exports = GetTriggeredAlertsCommand;
