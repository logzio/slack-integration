const Command = require('../../core/commands/command');
const ApiExtract = require('../../core/utils/apiExtract');

class GetAccountsCommand extends Command {
  constructor() {
    super();
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
