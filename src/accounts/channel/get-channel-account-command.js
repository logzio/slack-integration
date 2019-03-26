const Command = require('../../core/commands/command');
const LoggerFactory = require('../../core/logging/logger-factory');
const Messages = require('../../core/messages/messages');
const logger = LoggerFactory.getLogger(__filename);
const commandRegex = /get channel account/;

class GetCurrentChannelAccountCommand extends Command {
  constructor(teamConfigService) {
    super();
    this.teamConfigService = teamConfigService;
  }

  configure(controller) {
    controller.hears(
      commandRegex,
      'direct_message,direct_mention',
      (bot, message) => {
        return this.teamConfigService
          .getAccountForChannel(message.team, message.channel)
          .then(channelAccount=>{
            if(!channelAccount){
              bot.reply(message,Messages.NO_CHANNEL_ACCOUNT);
            }else{
              bot.reply(message,Messages.getCurrentChannel(channelAccount.config.alias));
            }
           })
          .catch(err => logger.error(err));
      }
    );
  }

  getCategory() {
    return 'get channel account';
  }

  getUsage() {
    return ['*get channel account* - Get current channel account'];
  }
}

module.exports = GetCurrentChannelAccountCommand;
