const Command = require('../../core/commands/command');
const commandRegex = /clear workspace account/;
const LoggerFactory = require('../../core/logging/logger-factory');
const logger = LoggerFactory.getLogger(__filename);
const { getEventMetadata } = require('../../core/logging/logging-metadata');
const Messages = require('../../core/messages/messages');

class ClearWorkspaceAccountCommand extends Command {
  constructor(defaultHandler) {
    super();
    this.defaultHandler = defaultHandler;
  }

  configure(controller) {
    controller.hears(
      [commandRegex],
      'direct_message,direct_mention',
      (bot, message) => {
        this.defaultHandler
          .clearDefault(message.team)
          .then(() => {
            bot.reply(message, `Okay, I cleared the workspace account.`);
          })
          .catch(err => {
            this.handleError(bot, message, err, err => {
              logger.warn(
                'Failed to clear workspace account',
                err,
                getEventMetadata({
                  message,
                  eventName: 'failed-to-clear-workspace-account'
                })
              );
              bot.reply(message, Messages.DEFAULT_ERROR_MESSAGE);
            });
          });
      }
    );
  }

  getCategory() {
    return 'defaults';
  }

  getUsage() {
    return [
      // '*clear workspace account* - Clear the default account for this workspace'
    ];
  }
}

module.exports = ClearWorkspaceAccountCommand;
