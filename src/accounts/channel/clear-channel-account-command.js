const Command = require('../../core/commands/command');
const commandRegex = /clear channel account/;
const LoggerFactory = require('../../core/logging/logger-factory');
const logger = LoggerFactory.getLogger(__filename);
const { getEventMetadata } = require('../../core/logging/logging-metadata');
const Messages = require('../../core/messages/messages');

class ClearChannelAccountCommand extends Command {
  constructor(defaultHandler) {
    super();
    this.defaultHandler = defaultHandler;
  }

  configure(controller) {
    controller.hears(
      [commandRegex],
      'direct_message,direct_mention',
      (bot, message) => {
        const {team = null, channel = null} = message;
        this.defaultHandler
          .isAccountUsedByChannel(team, channel)
          .then(res => {
            if (res) {
              this.defaultHandler
                .clearDefault(team, channel)
                .then(() => {
                  bot.reply(message, `Okay, I cleared the channel account.`);
                })
                .catch(err => {
                  this.handleError(
                    bot,
                    message,
                    err,
                    err => {
                      logger.warn(
                        'Failed to clear channel account',
                        err,
                        getEventMetadata(
                          message,
                          'failed-to-clear-channel-account'
                        )
                      );
                      bot.reply(message, Messages.DEFAULT_ERROR_MESSAGE);
                    }
                  );
                });
            } else {
              bot.reply(message, `There's no channel account set, so you're good. 😎`);
            }
          });
      }
    );
  }

  getCategory() {
    return 'channel configuration';
  }

  getUsage() {
    return [
      '*clear channel account* - Clear the default account for this channel'
    ];
  }
}

module.exports = ClearChannelAccountCommand;
