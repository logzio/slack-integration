const Command = require('../../core/commands/command');
const LoggerFactory = require('../../core/logging/logger-factory');
const { logEvent } = require('../../core/logging/logging-service');

const logger = LoggerFactory.getLogger(__filename);

class AddAccountCommand extends Command {
  constructor(teamConfigurationService) {
    super();
    this.teamConfigurationService = teamConfigurationService;
  }

  configure(controller) {
    controller.hears(
      ['setup'],
      'direct_message,direct_mention',
      (bot, message) =>
        this.handlePreviousVersionAddAccountRequest(bot, message)
    );
  }

  handlePreviousVersionAddAccountRequest(bot, message) {
    this.reportCommandWithCompanyName({
      userObject: message,
      teamConfigurationService: this.teamConfigurationService,
      logger,
      action: 'triggered the setup command',
      eventName: 'setup'
    });

    bot.reply(
      message,
      `I've been upgraded to work with multiple accounts now, so we replaced \`setup\`. From now on, if you want to add or remove an account, you can type \`@${bot.identity.name} add account\` or \`@${bot.identity.name} remove account\`.`
    );
  }

  getCategory() {
    return 'configure';
  }

  getUsage() {
    return [];
  }
}

module.exports = AddAccountCommand;
