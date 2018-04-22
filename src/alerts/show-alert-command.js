const Command = require('../core/commands/command');
const LoggerFactory = require('../core/logging/logger-factory');
const { getEventMetadata } = require('../core/logging/logging-metadata');

const logger = LoggerFactory.getLogger(__filename);

function ucFirst(text) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function createAlertDetailsMessage(alert) {
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
    const alertsClient = this.alertsClient;
    controller.hears([/show alert (.*)/], 'direct_message,direct_mention', function (bot, message) {
      const alertName = message.match[1];
      alertsClient.getAlertByName(message.team, alertName)
        .then(alert => bot.reply(message, createAlertDetailsMessage(alert)))
        .catch(err => {
          logger.warn(`Failed to get details for alert with title: ${alertName}`, err, getEventMetadata(message, 'failed-to-show-alert'));
          bot.reply(message, `Failed to get details for alert with title: ${alertName}`);
        });
    })
  }

  getCategory() {
    return 'alert';
  }

  getUsage() {
    return [
      '*show alert &lt;alert-name&gt;* - Displays alert details'
    ];
  }

}

module.exports = ShowAlertCommand;
