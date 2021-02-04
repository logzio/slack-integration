const Command = require('../core/commands/command');
const LoggerFactory = require('../core/logging/logger-factory');
const { getEventMetadata } = require('../core/logging/logging-metadata');
const logger = LoggerFactory.getLogger(__filename);
const Messages = require('../core/messages/messages');
const Table = require('easy-table');

class ShowAlertCommand extends Command {
  constructor(alertsClient) {
    super();
    this.alertsClient = alertsClient;
  }

  showAlertByName(channel, message, bot, withAlias) {
    logger.info(
      `User ${message.user} from team ${
        message.team
      } requested alert info by name`,
      getEventMetadata(message, 'get-alert-by-name')
    );
    const matches = message.match;
    let alias;
    let index = 2;
    if (withAlias) {
      alias = matches[1];
      index++;
    }
    const alertName = matches[index];
    this.alertsClient
      .getAlertByName(channel, message.team, alertName, alias)
      .then(alerts => this.sendMatchedObjectsTable(bot, message, alerts))
      .catch(err => {
        this.handleError(bot, message, err, err => {
          logger.warn(
            `Failed to get details for alert with title: ${alertName}`,
            err,
            getEventMetadata(message, 'failed-to-show-alert')
          );
          bot.reply(
            message,
            `Failed to get details for alert with title: ${alertName}`
          );
        });
      });
  }

  getAllAlerts(channel, message, bot, withAlias) {
    logger.info(
      `User ${message.user} from team ${
        message.team
      } requested all alerts info by name`,
      getEventMetadata(message, 'get-alerts-by-name')
    );
    const matches = message.match;
    let alias;
    let index = 2;
    if (withAlias) {
      alias = matches[1];
      index++;
    }
    const alertName = matches[index];
    this.alertsClient
      .getAlertByName(channel, message.team, null, alias)
      .then(alerts => this.sendMatchedObjectsTable(bot, message, alerts))
      .catch(err => {
        this.handleError(bot, message, err, err => {
          logger.warn(
            `Failed to get details for alert with title: ${alertName}`,
            err,
            getEventMetadata(message, 'failed-to-show-alert')
          );
          bot.reply(
            message,
            `Failed to get details for alert with title: ${alertName}`
          );
        });
      });
  }

  showAlertById(channel, message, bot, withAlias) {
    logger.info(
      `User ${message.user} from team ${
        message.team
      } requested alert info by id`,
      getEventMetadata(message, 'get-alert-by-id')
    );
    const matches = message.match;
    let alias;
    let index = 2;
    if (withAlias) {
      alias = matches[1];
      index++;
    }
    const alertId = matches[index];
    this.alertsClient
      .getAlertById(channel, message.team, alertId, alias)
      .then(this.createAlertDetailsMessage)
      .then(alertMessage => {
        bot.reply(message, Messages.getResults(alertMessage.alias));
        bot.reply(message, alertMessage.attachments);
      })
      .catch(err => {
        this.handleError(bot, message, err, err => {
          logger.warn(
            `Failed to get details for alert with id: ${alertId}`,
            err,
            getEventMetadata(message, 'failed-to-show-alert')
          );
          bot.reply(
            message,
            `Failed to get details for alert with id: ${alertId}`
          );
        });
      });
  }

  getCategory() {
    return 'alert';
  }

  getUsage() {
    return [
      '*[&lt;alias&gt;] get alerts* - Show alert definition',
      '*[&lt;alias&gt;] get alert &lt;alert-name&gt;* - Show alert definition',
      '*[&lt;alias&gt;] get alert by id &lt;alert-id&gt;* - Show alert definition'
    ];
  }

  static ucFirst(text) {
    return text
      ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
      : '';
  }

  createAlertDetailsMessage(alert) {
    if (typeof alert === 'string') {
      return alert;
    }

    const attachments = {
      attachments: [
        {
          title: alert.title,
          text: alert.description,
          fields: [
            {
              title: 'Severity',
              value: ShowAlertCommand.ucFirst(alert.severity),
              short: true
            },
            {
              title: 'Enabled',
              value: ShowAlertCommand.ucFirst(`${alert.isEnabled}`),
              short: true
            }
          ]
        }
      ]
    };
    const alertDetails = {
      attachments: attachments,
      alias: alert.alias
    };
    return alertDetails;
  }

  sendMatchedObjectsTable(bot, message, alerts) {
    const table = new Table();
    alerts.forEach(alert => {
      table.cell('Id', alert.alertId);
      table.cell('Name', alert.title);
      table.cell('Severity', ShowAlertCommand.ucFirst(alert.severity));
      table.cell('Enabled', ShowAlertCommand.ucFirst(`${alert.isEnabled}`));
      table.newRow();
    });

    bot.reply(message, Messages.getResults(alerts.alias), () =>
      this.botReplyAlertsTable(bot, table, message)
    );
  }

  botReplyAlertsTable(bot, table, message) {
    bot.api.files.upload(
      {
        content: table.toString(),
        channels: message.channel,
        filename: 'Alerts',
        filetype: 'text'
      },
      err => {
        if (err) {
          logger.error(
            'Failed to send kibana objects table',
            getEventMetadata(message, 'failed_to_send_kibana_objects'),
            err
          );
        }
      }
    );
  }
}

module.exports = ShowAlertCommand;
