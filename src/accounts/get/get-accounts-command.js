const Command = require('../../core/commands/command');
const ApiExtract = require('../../core/utils/apiExtract');
const LoggerFactory = require('../../core/logging/logger-factory');
const logger = LoggerFactory.getLogger(__filename);
class GetAccountsCommand extends Command {
  constructor(teamConfigService) {
    super();
    this.teamConfigService = teamConfigService;
  }

  configure(controller) {
    controller.hears(
      /accounts/,
      'direct_message,direct_mention',
      (bot, message) => {
        this.reportCommandWithCompanyName({
          userObject: message,
          eventName: 'get-accounts',
          action: 'triggered the get accounts command',
          logger,
          teamConfigurationService: this.teamConfigService
        });
        return this.teamConfigService
          .getAllAccountsSafeView(message.team, bot)
          .then(allAccountsSafeView =>
            this.replayWith(allAccountsSafeView.filter(Boolean), bot, message)
          )
          .catch(err => logger.error(err));
      }
    );
  }

  replayWith(allAccountsSafeView, bot, message) {
    bot.reply(
      message,
      allAccountsSafeView.length === 0
        ? "You haven't added any accounts yet. To add one, type @Alice add account"
        : createAccountsViewReply(allAccountsSafeView)
    );
  }

  getCategory() {
    return 'list accounts';
  }

  getUsage() {
    return ['*accounts* - List the Logz.io accounts in this workspace'];
  }
}

function createAccountsViewReply(allAccountsSafeView) {
  return (
    'These are the accounts in this workspace:\n' +
    allAccountsSafeView
      .map(item => ApiExtract.createAccountDescription(item))
      .join('')
  );
}

module.exports = GetAccountsCommand;
