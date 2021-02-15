const Command = require('../core/commands/command');
const LoggerFactory = require('../core/logging/logger-factory');
const { logEvent } = require('../core/logging/logging-service');
const { getEventMetadata } = require('../core/logging/logging-metadata');
const logger = LoggerFactory.getLogger(__filename);
const commandShowByIdWithAlias = /(.+) (get) alert by id (\d*)/;
const commandShowById = /(get) alert by id (\d*)/;
const commandShowByNameWithAlias = /(.+) (get) alert (.*)/;
const commandShowByName = /(get) alert (.*)/;
const commandShowAll = /(get) alerts/;
const commandShowAllWithAlias = /(.+) (get) alerts/;
const Messages = require('../core/messages/messages');
const Table = require('easy-table');

class ShowAlertCommand extends Command {
  constructor(alertsClient) {
    super();
    this.alertsClient = alertsClient;
    this.teamConfigurationService =
      alertsClient.httpClient.teamConfigurationService;
  }

  configure(controller) {
    controller.hears(
      [commandShowAllWithAlias],
      'direct_message,direct_mention',
      (bot, message) => {
        this.teamConfigurationService
          .getCompanyNameForTeamId(message.team)
          .then(companyName => {
            this.getAllAlerts(message.channel, message, bot, true, companyName);
          });
      }
    );

    controller.hears(
      [commandShowAll],
      'direct_message,direct_mention',
      async (bot, message) => {
        const companyName = await this.teamConfigurationService.getCompanyNameForTeamId(
          message.team
        );
        this.getAllAlerts(message.channel, message, bot, false, companyName);
      }
    );

    controller.hears(
      [commandShowByIdWithAlias],
      'direct_message,direct_mention',
      (bot, message) => {
        this.teamConfigurationService
          .getCompanyNameForTeamId(message.team)
          .then(companyName => {
            this.showAlertById(null, message, bot, true, companyName);
          });
      }
    );

    controller.hears(
      [commandShowById],
      'direct_message,direct_mention',
      (bot, message) => {
        this.teamConfigurationService
          .getCompanyNameForTeamId(message.team)
          .then(companyName => {
            this.showAlertById(
              message.channel,
              message,
              bot,
              false,
              companyName
            );
          });
      }
    );

    controller.hears(
      [commandShowByNameWithAlias],
      'direct_message,direct_mention',
      (bot, message) => {
        this.teamConfigurationService
          .getCompanyNameForTeamId(message.team)
          .then(companyName => {
            this.showAlertByName(null, message, bot, true, companyName);
          });
      }
    );

    controller.hears(
      [commandShowByName],
      'direct_message,direct_mention',
      (bot, message) => {
        this.teamConfigurationService
          .getCompanyNameForTeamId(message.team)
          .then(companyName => {
            this.showAlertByName(
              message.channel,
              message,
              bot,
              false,
              companyName
            );
          });
      }
    );
  }

  showAlertByName(channel, message, bot, withAlias, companyName) {
    logEvent({
      userObject: message,
      eventName: 'get-alert-by-name',
      action: 'requested alert info by name',
      companyName,
      logger
    });
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
            getEventMetadata({ message, eventName: 'failed-to-show-alert' })
          );
          bot.reply(
            message,
            `Failed to get details for alert with title: ${alertName}`
          );
        });
      });
  }

  getAllAlerts(channel, message, bot, withAlias, companyName) {
    logEvent({
      userObject: message,
      eventName: 'get-alerts-by-name',
      action: 'requested all alerts info by name',
      companyName,
      logger
    });
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
            getEventMetadata({ message, eventName: 'failed-to-show-alert' })
          );
          bot.reply(
            message,
            `Failed to get details for alert with title: ${alertName}`
          );
        });
      });
  }

  showAlertById(channel, message, bot, withAlias, companyName) {
    logEvent({
      userObject: message,
      action: 'requested alert info by id',
      eventName: 'get-alert-by-id',
      companyName,
      logger
    });
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
            getEventMetadata({ message, eventName: 'failed-to-show-alert' })
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
            getEventMetadata({
              message,
              eventName: 'failed_to_send_kibana_objects'
            }),
            err
          );
        }
      }
    );
  }
}

module.exports = ShowAlertCommand;
