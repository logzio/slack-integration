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
      return this.teamConfigService
        .getAllAccountsSafeView(message.team)
        .then(allAccountsSafeView => {
          bot.reply(message, "Sit tight while I get those accounts for you...");
          let accountsString = allAccountsSafeView.map(item => `Account name:${item.accountName}, Alias:${item.accountAlias}\n`).join("");
          return bot.reply(message, allAccountsSafeView.length === 0 ? "no accounts found for this workspace" : accountsString);
        }).catch(err => logger.error(err));
    });
  }

  getCategory() {
    return 'list accounts';
  }

  getUsage() {
    return [
      '*accounts* - List the Logz.io accounts in this workspace.',
    ];
  }
}

module.exports = GetAccountsCommand;
