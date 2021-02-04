const { BotkitConversation } = require('botkit');
const Command = require('../../core/commands/command');
const LoggerFactory = require('../../core/logging/logger-factory');
const logger = LoggerFactory.getLogger(__filename);
const { getEventMetadata } = require('../../core/logging/logging-metadata');
const Messages = require('../../core/messages/messages');

class SetWorkspaceAccountCommand extends Command {
  constructor(defaultHandler) {
    super();
    this.defaultHandler = defaultHandler;
  }

  async setDefaultWorkspace(message, bot, alias) {
    try {
      await this.defaultHandler.setDefault(message.team, alias);
      await bot.reply(message, `Okay, ${alias} is the workspace account now`);
    } catch (err) {
      await this.handleError(bot, message, err, async err => {
        logger.warn(
          'Failed to set workspace account',
          err,
          getEventMetadata(message, 'failed-to-set-workspace-account')
        );
        await bot.reply(message, Messages.DEFAULT_ERROR_MESSAGE);
      });
    }
  }

  getCategory() {
    return 'defaults';
  }

  getUsage() {
    return [
      '*set workspace account &lt;alias&gt;* - Set a default account for Alice to use for this workspace'
    ];
  }

  // ask(bot, user, teamId, message) {
  //   const command = this;
  //
  //   bot.startConversation(message, (err, convo) => {
  //     convo.addQuestion(
  //       'Which account do you want to set as the workspace account?',
  //       [
  //         {
  //           default: true,
  //           callback: function(response, convo) {
  //             command.setDefaultWorkspace(message, bot, response.text, false);
  //             convo.stop();
  //           }
  //         }
  //       ],
  //       {},
  //       'default'
  //     );
  //     convo.activate();
  //   });
  // }
}

module.exports = SetWorkspaceAccountCommand;
