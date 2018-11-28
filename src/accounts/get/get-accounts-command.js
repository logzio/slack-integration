const Command = require('../../core/commands/command');
const LoggerFactory = require('../../core/logging/logger-factory');

const logger = LoggerFactory.getLogger(__filename);

class SetDefault extends Command {

  constructor(storage) {
    super();
    this.storage = storage;
  }
  configure(controller) {
    controller.hears('accounts', 'direct_message,direct_mention', (bot, message) => {
      bot.reply(message, this.storage.configuredAccounts.all(message.team).map(configuredAccount => ({
        accountName: configuredAccount.getRealName(),
        accountAlias: configuredAccount.getAlias()
      })));
    });
  }
}

module.exports(SetDefault);
