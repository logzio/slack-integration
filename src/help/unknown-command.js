const Command = require('../core/commands/command');
const LoggerFactory = require('../core/logging/logger-factory');
const { sendUsage } = require('./usage-message-supplier');
const { logEvent } = require('../core/logging/logging-service');

const logger = LoggerFactory.getLogger(__filename);

class UnknownCommand extends Command {
  constructor(teamConfigurationService) {
    super();
    this.teamConfigurationService = teamConfigurationService;
  }

  configure(controller) {
    controller.hears(
      [/.*/],
      'direct_message,direct_mention',
      (bot, message) => {
        this.teamConfigurationService
          .getCompanyNameForTeamId(message.team)
          .then(companyName => {
            const userCommand = message.text;
            logEvent({
              userObject: message,
              action: 'entered unknown command',
              eventName: 'user-entered-unknown-command',
              companyName,
              logger
            });

            bot.reply(message, `Unrecognized command: ${userCommand}`, () =>
              sendUsage(bot, message, '')
            );
          });
      }
    );
  }

  getCategory() {
    return 'help';
  }

  getUsage() {
    return [];
  }
}

module.exports = UnknownCommand;
