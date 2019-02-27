const Command = require('../../core/commands/command');
const LoggerFactory = require('../../core/logging/logger-factory');
const { getEventMetadata } = require('../../core/logging/logging-metadata');

const logger = LoggerFactory.getLogger(__filename);

class AddAccountCommand extends Command {
  constructor(setupDialogSender, teamConfigService) {
    super();
    this.setupDialogSender = setupDialogSender;
    this.teamConfigService = teamConfigService;
  }

  configure(controller) {
    controller.hears(
      ['add account'],
      'direct_message,direct_mention',
      (bot, message) => {
        logger.info(
          `User ${message.user} from team ${
            message.team
          } triggered setup command`,
          getEventMetadata(message, 'setup')
        );
        this.teamConfigService.getDefault(message.team.id).then(config => {
          this.teamConfigService
            .doesAliasExist(message.team.id, config.getAlias())
            .then(exist => {
              if (config.getLogzioApiToken() && !exist) {
                this.setupDialogSender.sendSetupAliasMessage(
                  bot,
                  message.user,
                  config,
                  message
                );
              } else {
                if (message.type !== 'direct_message') {
                  bot.reply(
                    message,
                    `Sending you the configuration options privately <@${
                      message.user
                    }>`
                  );
                }
                this.setupDialogSender.sendSetupMessage(bot, message.user);
              }
            });
        });
      }
    );
  }

  getCategory() {
    return 'configure';
  }

  getUsage() {
    return ['*add account* - Add a new Logz.io account to Slack'];
  }
}

module.exports = AddAccountCommand;
