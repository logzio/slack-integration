const Command = require('../../core/commands/command');
const commandRegex = /set channel account (.*)/;

class SetChannelAccountCommand extends Command {

  constructor(channelHandler) {
    super();
    this.channelHandler = channelHandler;
  }
  configure(controller) {
    controller.hears([commandRegex], 'direct_message,direct_mention', (bot, message) => {
      if (message.type === 'direct_message') {
        bot.reply(message, "I can't do that in a direct message. Please send me a message from a Slack channel.");
        return;
      }
      let alias = message.match[1];
      this.channelHandler.setDefault(message.team, message.channel, alias).then(channelDefaultHandler => {
        if (!channelDefaultHandler) bot.reply(message, `alias ${alias} does not exist`);
        else
          bot.reply(message, `Okay, '${alias}' is the channel account now.`);
      });
    });
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
