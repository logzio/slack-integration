const Command = require('../../core/commands/command');
const commandRegex = /set channel account (.*)/;

class SetActiveCommand extends Command {

  constructor(channelHandler) {
    super();
    this.channelHandler = channelHandler;
  }
  configure(controller) {
    controller.hears([commandRegex], 'direct_message,direct_mention', (bot, message) => {
      if (message.type === 'direct_message') {
        bot.reply(message, "only allowed on channels");
        return;
      }
      let alias = message.text.match(commandRegex)[1];
      this.channelHandler.setDefault(message.team, message.channel, alias).then(() => {
        bot.reply(message, `account ${alias} was set as default for channel ${message.channel}`);
      });
    });
  }


  getCategory() {
    return 'channel configuration';
  }

  getUsage() {
    return [
      '*set channel account {account alias}* - set account for channel.',
    ];
  }

}

module.exports = SetActiveCommand;
