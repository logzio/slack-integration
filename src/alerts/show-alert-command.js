const Command = require('../core/commands/command');
const LoggerFactory = require('../core/logging/logger-factory');
const { getEventMetadata } = require('../core/logging/logging-metadata');
const logger = LoggerFactory.getLogger(__filename);
const commandShowByIdWithAlias = /(.+) (show|get) alert by id (\d*)/;
const commandShowById = /(show|get) alert by id (\d*)/;
const commandShowByNameWithAlias = /(.+) (show|get) alert (.*)/;
const commandShowByName = /(show|get) alert (.*)/;




class ShowAlertCommand extends Command {

  constructor(alertsClient) {
    super();
    this.alertsClient = alertsClient;
  }

  configure(controller) {

    controller.hears([commandShowByIdWithAlias], 'direct_message,direct_mention', (bot, message) => {
      this.showAlertById(null,message, bot, true);
    });

    controller.hears([commandShowById], 'direct_message,direct_mention', (bot, message) => {
      this.showAlertById(message.channel,message, bot, false);
    });

    controller.hears([commandShowByNameWithAlias], 'direct_message,direct_mention', (bot, message) => {
      this.showAlertByName(null,message, bot, true);
    });

    controller.hears([commandShowByName], 'direct_message,direct_mention', (bot, message) => {
      this.showAlertByName(message.channel,message, bot, false);
    });
  }

  showAlertByName(channel,message, bot, withAlias) {
    logger.info(`User ${message.user} from team ${message.team} requested alert info by name`, getEventMetadata(message, 'get-alert-by-name'));
    const matches = message.match;
    let alias;
    let index = 2;
    if(withAlias){
      alias = matches[1];
      index++
    }
    const alertName = matches[index];
    this.alertsClient.getAlertByName(channel, message.team, alertName, alias)
      .then(alert =>
        this.createAlertDetailsMessage(alert))
      .then(alertMessage =>
        bot.reply(message, alertMessage))
      .catch(err => {
        this.handleError(bot, message, err, err => {
          logger.warn(`Failed to get details for alert with title: ${alertName}`, err, getEventMetadata(message, 'failed-to-show-alert'));
          bot.reply(message, `Failed to get details for alert with title: ${alertName}`);
        });
      });
  }

  showAlertById(channel,message, bot, withAlias) {
    logger.info(`User ${message.user} from team ${message.team} requested alert info by id`, getEventMetadata(message, 'get-alert-by-id'));
    const matches = message.match;
    let alias;
    let index = 2;
    if(withAlias){
      alias = matches[1];
      index++;
    }
    const alertId = matches[index];
    this.alertsClient.getAlertById(channel, message.team, alertId, alias)
      .then(this.createAlertDetailsMessage)
      .then(alertMessage =>
        bot.reply(message, alertMessage))
      .catch(err => {
        this.handleError(bot, message, err, err => {
          logger.warn(`Failed to get details for alert with id: ${alertId}`, err, getEventMetadata(message, 'failed-to-show-alert'));
          bot.reply(message, `Failed to get details for alert with id: ${alertId}`);
        });
      });
  }

  getCategory() {
    return 'alert';
  }

  getUsage() {
    return [
      '*[&lt;alias&gt;] show alert &lt;alert-name&gt;* - Show alert definition',
      '*[&lt;alias&gt;] show alert by id &lt;alert-id&gt;* - Show alert definition',
    ];
  }

   ucFirst(text) {
    return text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : '';
  }

   createAlertDetailsMessage(alert) {
    if (typeof alert === 'string') {
      return alert;
    }

    return {
      attachments: [{
        title: alert.title,
        text: alert.description,
        fields: [{
          title: "Severity",
          value: this.ucFirst(alert.severity),
          short: true
        }, {
          title: "Enabled",
          value: this.ucFirst(`${alert.isEnabled}`),
          short: true
        }],
      }]
    };
  }

}

module.exports = ShowAlertCommand;
