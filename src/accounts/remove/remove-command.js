const Command = require('../../core/commands/command');
const LoggerFactory = require('../../core/logging/logger-factory');
const { getEventMetadata } = require('../../core/logging/logging-metadata');
const { logEvent } = require('../../core/logging/logging-service');
const logger = LoggerFactory.getLogger(__filename);
const commandRegexWithAlias = /remove account (.+)/;

const commandRegex = /remove account/;

class RemoveCommand extends Command {
  constructor(removeAccountHandler) {
    super();
    this.removeAccountHandler = removeAccountHandler;
    this.teamConfigurationService = removeAccountHandler.teamConfigService;
  }

  configure(controller) {
    controller.hears(
      [commandRegexWithAlias],
      'direct_message,direct_mention,message_received',
      (bot, message) => {
        let alias = message.text.match(commandRegexWithAlias)[1];
        this.removeAccount(message, alias, bot);
      }
    );

    controller.hears(
      [commandRegex],
      'direct_message,direct_mention,message_received',
      (bot, message) => {
        this.removeAccount(message, null, bot);
      }
    );
  }

  removeAccount(message, alias, bot) {
    this.teamConfigurationService
      .getCompanyNameForTeamId(message.team)
      .then(companyName => {
        logEvent({
          userObject: message,
          eventName: 'remove-account',
          action: `triggered remove command on ${alias}`,
          companyName,
          logger
        });
        this.removeAccountHandler
          .removeAccount(
            message.team,
            message.channel,
            alias,
            bot,
            message.user,
            message
          )
          .catch(err => {
            this.handleError(bot, message, err, err => {
              logger.warn(
                'Failed to remove account',
                err,
                getEventMetadata({
                  message,
                  eventName: 'failed-to-remove-account'
                })
              );
              bot.reply(message, 'Failed to remove account');
            });
          });
      });
  }

  getCategory() {
    return 'configure';
  }

  getUsage() {
    return ['*remove account <alias>* - Remove a Logz.io account from Slack'];
  }
}

module.exports = RemoveCommand;
