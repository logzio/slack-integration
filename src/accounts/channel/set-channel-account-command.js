const Command = require('../../core/commands/command');
const commandRegexWithAlias = /set channel account (.*)/;
const commandRegex = /set channel account/;
const LoggerFactory = require('../../core/logging/logger-factory');
const logger = LoggerFactory.getLogger(__filename);
const { logEvent } = require('../../core/logging/logging-service');
const { getEventMetadata } = require('../../core/logging/logging-metadata');
const Messages = require('../../core/messages/messages');

class SetChannelAccountCommand extends Command {
  constructor(channelHandler) {
    super();
    this.channelHandler = channelHandler;
    this.teamConfigurationService = channelHandler.teamConfService;
  }

  configure(controller) {
    controller.hears(
      [commandRegexWithAlias],
      'direct_message,direct_mention',
      (bot, message) => {
        let alias = message.match[1];
        this.setChannel(message, bot, alias);
        this.reportCommand(message);
      }
    );

    controller.hears(
      [commandRegex],
      'direct_message,direct_mention',
      (bot, message) => {
        this.ask(bot, message);
        this.reportCommand(message);
      }
    );
  }

  ask(bot, message) {
    const command = this;
    bot.startConversation(message, (err, convo) => {
      convo.addQuestion(
        'Which account do you want to set as the channel account?',
        [
          {
            default: true,
            callback: function(response, convo) {
              command.setChannel(message, bot, response.text);
              convo.stop();
            }
          }
        ],
        {},
        'default'
      );
      convo.activate();
    });
  }

  setChannel(message, bot, alias) {
    this.channelHandler
      .setDefault(message.team, message.channel, alias)
      .then(() => {
        bot.reply(message, `Okay, '${alias}' is the channel account now.`);
      })
      .catch(err => {
        this.handleError(bot, message, err, err => {
          logger.warn(
            'Failed to set channel account',
            err,
            getEventMetadata({
              message,
              eventName: 'failed-to-set-channel-account'
            })
          );
          bot.reply(message, Messages.DEFAULT_ERROR_MESSAGE);
        });
      });
  }

  async reportCommand(userObject) {
    const companyName = await this.teamConfigurationService.getCompanyNameForTeamId(
      userObject.team
    );

    logEvent({
      userObject,
      eventName: 'set-channel-account',
      action: 'triggered the get channel account command',
      companyName,
      logger
    });
  }

  getCategory() {
    return 'channel configuration';
  }

  getUsage() {
    return [
      '*set channel account &lt;alias&gt;* - Set a default account for Alice to use in this channel. You can set this for as many channels as you want.'
    ];
  }
}

module.exports = SetChannelAccountCommand;
