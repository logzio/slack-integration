const Command = require('../../core/commands/command');
const commandRegexWithAlias = /set channel account (.*)/;
const commandRegex = /set channel account/;

class SetChannelAccountCommand extends Command {

  constructor(channelHandler) {
    super();
    this.channelHandler = channelHandler;
  }
  configure(controller) {
    controller.hears([commandRegexWithAlias], 'direct_message,direct_mention', (bot, message) => {
      let alias = message.match[1];
      this.setChannel(message, bot, alias);
    });

    controller.hears([commandRegex], 'direct_message,direct_mention', (bot, message) => {
      this.ask(bot, message.user, message.team ,message)
    });
  }

  ask(bot, user, teamId ,message) {
    const command = this;
    bot.startConversation(message, (err, convo) => {
      convo.addQuestion('Which account do you want to set as the channel account?'
        , [
          {
            default: true,
            callback: function (response, convo) {
              command.setChannel(message, bot, response.text);
              convo.stop();
            }
          }
        ], {}, 'default');
      convo.activate();
    });
  }

  setChannel(message, bot, alias) {
    // if (message.type === 'direct_message') {
    //   bot.reply(message, "I can't do that in a direct message. Please send me a message from a Slack channel.");
    // } else {
      this.channelHandler.setDefault(message.team, message.channel, alias)
        .then(() => {
        // if (!channelDefaultHandler)
        //   bot.reply(message, `alias ${alias} does not exist`);
        // else
          bot.reply(message, `Okay, '${alias}' is the channel account now.`);
      })
        .catch(err => {
          this.handleError(bot, message, err, err => {
            logger.warn('Failed to set channel account', err, getEventMetadata(message, 'failed-to-set-channel-account'));
          },true);
        });
      ;
   // }
  }

  getCategory() {
    return 'channel configuration';
  }

  getUsage() {
    return [
      '*set channel account {account alias}* - Set a default account for Alice to use in this channel. You can set this for as many channels as you want.',
    ];
  }

}

module.exports = SetChannelAccountCommand;
