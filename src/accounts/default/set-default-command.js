const Command = require('../../core/commands/command');
const LoggerFactory = require('../../core/logging/logger-factory');
const commandRegexWithAlias = /set workspace account (.*)/;
const commandRegex = /set workspace account/;
const logger = LoggerFactory.getLogger(__filename);
const { getEventMetadata } = require('../../core/logging/logging-metadata');

class SetWorkspaceAccountCommand extends Command {
  constructor(defaultHandler) {
    super();
    this.defaultHandler = defaultHandler;
  }
  configure(controller) {
    controller.hears(
      [commandRegexWithAlias],
      'direct_message,direct_mention',
      (bot, message) => {
        let alias = message.text.match(commandRegexWithAlias)[1];
        this.setDefaultWorkspace(message, bot, alias, true);
      }
    );

    controller.hears(
      [commandRegex],
      'direct_message,direct_mention',
      (bot, message) => {
        this.ask(bot, message.user, message.team, message);
      }
    );
  }

  setDefaultWorkspace(message, bot, alias) {
    this.defaultHandler
      .setDefault(message.team, alias)
      .then(() => {
        bot.reply(message, `Okay, ${alias} is the workspace account now`);
      })
      .catch(err => {
        this.handleError(
          bot,
          message,
          err,
          err => {
            logger.warn(
              'Failed to set workspace account',
              err,
              getEventMetadata(message, 'failed-to-set-workspace-account')
            );
          },
          true
        );
      });
  }

  ask(bot, user, teamId, message) {
    const command = this;

    bot.startConversation(message, (err, convo) => {
      convo.addQuestion(
        'Which account do you want to set as the workspace account?',
        [
          {
            default: true,
            callback: function(response, convo) {
              command.setDefaultWorkspace(message, bot, response.text, false);
              convo.stop();
            }
          }
        ],
        {},
        'default'
      );
      convo.activate();
    });
  }

  getCategory() {
    return 'defaults';
  }

  getUsage() {
    return [
      '*set workspace account &lt;alias&gt;* - Set a default account for Alice to use for this workspace'
    ];
  }
}

module.exports = SetWorkspaceAccountCommand;
