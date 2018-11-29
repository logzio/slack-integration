const Command = require('../../core/commands/command');
const LoggerFactory = require('../../core/logging/logger-factory');
const logger = LoggerFactory.getLogger(__filename);


class GetAccountsCommand extends Command {

  constructor(teamConfigService) {
    super();
    this.teamConfigService = teamConfigService;
  }

  configure(controller) {
    controller.hears(/accounts/, 'direct_message,direct_mention', (bot, message) => {
      bot.reply(message, "getting accounts for workspace");
      return this.teamConfigService
        .getAllAccountsSafeView(message.team)
        .then(allAccountsSafeView => {
          return bot.reply(message, allAccountsSafeView.length === 0 ? "no accounts found for this workspace" : allAccountsSafeView);
        }).catch(err => logger.error(err));
    });
  }

  getCategory() {
    return 'list accounts';
  }

  getUsage() {
    return [
      '*accounts* - list all configured accounts.',
    ];
  }
}

module.exports = GetAccountsCommand;
