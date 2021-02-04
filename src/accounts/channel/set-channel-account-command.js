const { BotkitConversation } = require('botkit');
const Command = require('../../core/commands/command');
const LoggerFactory = require('../../core/logging/logger-factory');
const logger = LoggerFactory.getLogger(__filename);
const { getEventMetadata } = require('../../core/logging/logging-metadata');
const Messages = require('../../core/messages/messages');

class SetChannelAccountCommand extends Command {
  constructor(channelHandler) {
    super();
    this.channelHandler = channelHandler;
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
            getEventMetadata(message, 'failed-to-set-channel-account')
          );
          bot.reply(message, Messages.DEFAULT_ERROR_MESSAGE);
        });
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

  // ask(bot, message) {
  //   const command = this;
  //   bot.startConversation(message, (err, convo) => {
  //     convo.addQuestion(
  //       'Which account do you want to set as the channel account?',
  //       [
  //         {
  //           default: true,
  //           callback: function(response, convo) {
  //             command.setChannel(message, bot, response.text);
  //             convo.stop();
  //           }
  //         }
  //       ],
  //       {},
  //       'default'
  //     );
  //     convo.activate();
  //   });
  // }
}

module.exports = SetChannelAccountCommand;
