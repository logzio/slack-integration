const Command = require('../core/commands/command');
const LoggerFactory = require('../core/logging/logger-factory');
const { logEvent } = require('../core/logging/logging-service');
const { sendUsage } = require('./usage-message-supplier');

const logger = LoggerFactory.getLogger(__filename);

class HelpCommand extends Command {
  constructor(teamConfigurationService) {
    super();
    this.teamConfigurationService = teamConfigurationService;
  }

  configure(controller) {
    controller.hears(
      [/help ([\w-]+)/, /help$/],
      'direct_message,direct_mention',
      (bot, message) => {
        this.teamConfigurationService.getCompanyNameForTeamId(message.team)
          .then(companyName => {
            logEvent({
              userObject: message,
              eventName: 'usage-list',
              logger,
              companyName,
              action: 'requested usage list'
            });
            let query = message.match[1] || '';
            sendUsage(bot, message, query);
          });
      }
    );
  }

  getCategory() {
    return 'help';
  }

  getUsage() {
    return [
      '*help* - Show help for all commands',
      '*help &lt;query&gt;* - Show help for commands that include the query'
    ];
  }
}

module.exports = HelpCommand;
