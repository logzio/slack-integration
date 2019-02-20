const Command = require('../../core/commands/command');

const commandRegex = /clear channel account/;

class ClearChannelAccountCommand extends Command {
  constructor(defaultHandler) {
    super();
    this.defaultHandler = defaultHandler;
  }

  configure(controller) {
    controller.hears([commandRegex], 'direct_message,direct_mention', (bot, message) => {


      this.defaultHandler.isAccountUsedByChannel(message.team, message.channel)
        .then(res => {

          if(res){
            this.defaultHandler.clearDefault(message.team, message.channel)
              .then(()=>{
                bot.reply(message, `Okay, I cleared the channel account.`)
              })
              .catch(err => {
                this.handleError(bot, message, err, err => {
                  logger.warn('Failed to clear channel account', err, getEventMetadata(message, 'failed-to-clear-channel-account'));
                },true);
              });
          }else{
            bot.reply(message, `There is no channel account configured.`)
          }


        })




    });
  }

  getCategory() {
    return 'channel configuration';
  }

  getUsage() {
    return [
      '*clear channel account* - Clear the default account for this channel',
    ];
  }

}

module.exports = ClearChannelAccountCommand;
