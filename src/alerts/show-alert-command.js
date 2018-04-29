const Command = require('../core/commands/command');
const LoggerFactory = require('../core/logging/logger-factory');
const { getEventMetadata } = require('../core/logging/logging-metadata');

const logger = LoggerFactory.getLogger(__filename);

function ucFirst(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : '';
}

function createAlertDetailsMessage(alert) {
  if (typeof alert === 'string') {
    return alert;
  }

  return {
    attachments: [{
      title: alert.title,
      text: alert.description,
      fields: [{
        title: "Severity",
        value: ucFirst(alert.severity),
        short: true
      }, {
        title: "Enabled",
        value: ucFirst(`${alert.isEnabled}`),
        short: true
      }],
    }]
  };
}

class ShowAlertCommand extends Command {

  constructor(alertsClient) {
    super();
    this.alertsClient = alertsClient;
  }
  configure(controller) {
    controller.hears([/(show|get) alert by id (\d*)/], 'direct_message,direct_mention', (bot, message) => {
      const alertId = message.match[2];
      this.alertsClient.getAlertById(message.team, alertId)
        .then(createAlertDetailsMessage)
        .then(alertMessage => bot.reply(message, alertMessage))
        .catch(err => {
          logger.warn(`Failed to get details for alert with id: ${alertId}`, err, getEventMetadata(message, 'failed-to-show-alert'));
          bot.reply(message, `Failed to get details for alert with id: ${alertId}`);
        });
    });

    controller.hears([/(show|get) alert (.*)/], 'direct_message,direct_mention', (bot, message) => {
      const alertName = message.match[2];
      this.alertsClient.getAlertByName(message.team, alertName)
        .then(createAlertDetailsMessage)
        .then(alertMessage => bot.reply(message, alertMessage))
        .catch(err => {
          logger.warn(`Failed to get details for alert with title: ${alertName}`, err, getEventMetadata(message, 'failed-to-show-alert'));
          bot.reply(message, `Failed to get details for alert with title: ${alertName}`);
        });
    });
  }

  getCategory() {
    return 'alert';
  }

  getUsage() {
    return [
      '*show alert &lt;alert-name&gt;* - Displays alert details',
      '*show alert by id &lt;alert-id&gt;* - Displays alert details',
    ];
  }

}

module.exports = ShowAlertCommand;
