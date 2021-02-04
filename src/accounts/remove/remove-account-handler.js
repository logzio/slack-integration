const HttpClient = require('../../core/client/http-client');
const { teamConfigurationService } = require('../../core/configuration');
const ApiExtract = require('../../core/utils/apiExtract');
const Messages = require('../../core/messages/messages');
const shouldDeleteAccountWithCurrentChannels = ' is used in these channels:';
const areYouSure = ' Are you sure you want to remove it from Slack?';
const shouldDeleteAccount = 'Are you sure you want to remove ';

function getMessageWithButtons(text, removeStyle) {
  let removeButton = {
    text: 'Remove',
    value: 'remove-yes',
    type: 'button',
    name: 'yes'
  };
  if (removeStyle) {
    removeButton.style = 'danger';
  }
  return {
    attachments: [
      {
        title: '',
        text: text,
        callback_id: 'remove-account',
        attachment_type: 'default',
        delete_original: true,
        actions: [
          removeButton,
          {
            text: 'Cancel',
            value: 'remove-no',
            type: 'button',
            name: 'no'
          }
        ]
      }
    ]
  };
}

class removeAccountHandler {
  async removeAccount(teamId, channel, userAlias, bot, user, message) {
    if (!userAlias) {
      return this.PromiseToRemove(
        teamId,
        channel,
        userAlias,
        bot,
        user,
        message
      );
    } else {
      return HttpClient.validateAlias(teamId, userAlias).then(() =>
        this.PromiseToRemove(teamId, channel, userAlias, bot, user, message)
      );
    }
  }

  async PromiseToRemove(teamId, channel, userAlias, bot, user, message) {
    let teamConfiguration;
    let alias = userAlias;
    const configuration = await teamConfigurationService.getDefault(teamId);
    if (!userAlias) {
      await HttpClient.validateConfiguration(configuration);
    }
    teamConfiguration = configuration;
    if (!alias) {
      alias = teamConfiguration.getAlias();
    }

    const accountConfiguration = await teamConfigurationService.getAccountForChannel(
      teamId,
      channel
    );
    if (!userAlias && accountConfiguration) {
      alias = accountConfiguration.getAlias();
    }
    if (teamConfiguration.config.alias === alias) {
      const numberOfAccounts = await teamConfigurationService.numberOfAccounts(
        teamId
      );
      await this.ConfirmRemove(
        teamConfiguration,
        alias,
        bot,
        user,
        teamId,
        numberOfAccounts,
        message
      );
    }
  }

  async ConfirmRemove(
    teamConfiguration,
    alias,
    bot,
    user,
    teamId,
    numberOfAccounts,
    message
  ) {
    let canDeleteDefault = false;
    if (teamConfiguration.config.alias === alias) {
      let deleteDefaultMessage;
      if (numberOfAccounts === 1) {
        canDeleteDefault = true;
        deleteDefaultMessage = Messages.YOU_ARE_ABOUT_TO_REMOVE_LAST_ACCOUNT;
        const messageWithButtons = getMessageWithButtons(
          deleteDefaultMessage,
          true
        );
        this.askForApproval(
          alias,
          bot,
          user,
          teamId,
          messageWithButtons,
          true,
          canDeleteDefault
        );
      } else {
        deleteDefaultMessage = Messages.CANT_REMOVE_DEFAULT_ACCOUNT;
        bot.reply(message, deleteDefaultMessage);
      }
    } else {
      this.teamConfigService
        .getAliasAccountsUsedByChannel(teamId, alias)
        .then(accounts => {
          if (accounts.length > 0) {
            ApiExtract.extractAccountsChannels(bot, accounts).then(
              channelNames => {
                const messageWithButtons = getMessageWithButtons(
                  `${alias}${shouldDeleteAccountWithCurrentChannels}${channelNames}.${areYouSure}`
                );
                this.askForApproval(
                  alias,
                  bot,
                  user,
                  teamId,
                  messageWithButtons,
                  false
                );
              }
            );
          } else {
            const messageWithButtons = getMessageWithButtons(
              `${shouldDeleteAccount}${alias}?`
            );
            this.askForApproval(
              alias,
              bot,
              user,
              teamId,
              messageWithButtons,
              false
            );
          }
        });
    }
  }

  async askForApproval(
    alias,
    bot,
    user,
    teamId,
    messageWithButtons,
    shouldDeleteDefault,
    canDeleteDefault
  ) {
    // TODO: MAKE THIS WORK FOR BOTKIT 4
    // await bot.startPrivateConversation(user);
    // await bot.beginDialog('remove-account');

    await bot.startPrivateConversation({ user }, (err, convo) => {
      convo.addMessage(
        {
          text: canDeleteDefault
            ? Messages.REMOVED_ACCOUNT_MESSAGE
            : `Okay, I removed ${alias} from Slack.`
        },
        'successfully_removed_thread'
      );

      convo.addMessage(
        {
          text: canDeleteDefault
            ? Messages.I_WONT_REMOVE_ACCOUNT
            : `Okay, ${alias} is still active.`
        },
        'canceled'
      );

      convo.addMessage(
        {
          text: `Failed to remove account`
        },
        'error'
      );

      convo.addQuestion(
        messageWithButtons,
        [
          {
            pattern: 'remove-yes',
            callback: function(response, convo) {
              const remove = shouldDeleteDefault
                ? teamConfigService.removeDefaultAccount(teamId, alias)
                : teamConfigService.removeAccount(teamId, alias);
              return remove.then(res => {
                if (res) {
                  convo.gotoThread('successfully_removed_thread');
                } else {
                  convo.gotoThread('error');
                }
              });
            }
          },
          {
            pattern: 'remove-no',
            callback: function(response, convo) {
              convo.gotoThread('canceled');
            }
          },
          {
            default: true,
            callback: function(response, convo) {
              convo.gotoThread('canceled');
            }
          }
        ],
        {}
      );
      convo.activate();
    });
  }
}

module.exports = removeAccountHandler;
