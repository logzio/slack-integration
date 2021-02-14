const Command = require('../../core/commands/command');
const LoggerFactory = require('../../core/logging/logger-factory');
const { logEvent } = require('../../core/logging/logging-service');

const logger = LoggerFactory.getLogger(__filename);

class AddAccountCommand extends Command {
  constructor(setupDialogSender) {
    super();
    this.setupDialogSender = setupDialogSender;
    this.teamConfigurationService = setupDialogSender.teamConfigurationService;
  }

  configure(controller) {
    controller.hears(
      ['add account'],
      'direct_message,direct_mention',
      (bot, message) => this.handleAddAccountRequest(bot, message)
    );
  }

  handleAddAccountRequest(bot, message) {
    this.teamConfigurationService
      .getCompanyNameForTeamId(message.team)
      .then(companyName => {
        logEvent({
          userObject: message,
          action: 'triggered add account command',
          eventName: 'setup',
          companyName,
          logger
        });
        if (message.type !== 'direct_message') {
          bot.reply(
            message,
            `Sending you the configuration options privately <@${message.user}>`
          );
        }
        this.setupDialogSender.sendSetupMessage(bot, message.user);
      });
  }

  getCategory() {
    return 'configure';
  }

  getUsage() {
    return ['*add account* - Add a new Logz.io account to Slack'];
  }
}

module.exports = AddAccountCommand;
