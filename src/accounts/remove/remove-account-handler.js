const HttpClient = require('../../core/client/http-client');
const ApiExtract = require('../../core/utils/apiExtract');
const Messages = require('../../core/messages/messages');
const shouldDeleteAccountWithCurrentChannels = ' is used in these channels:';
const areYouSure = ' Are you sure you want to remove it from Slack?';
const shouldDeleteAccount = 'Are you sure you want to remove ';

function getMessageWithButtons(text,removeStyle) {


  let removeButton = {
    text: 'Remove',
    value: 'remove-yes',
    type: 'button',
    name: 'yes'
  };
  if(removeStyle){
    removeButton.style = "danger";
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
  constructor(teamConfigService) {
    this.teamConfigService = teamConfigService;
  }

  removeAccount(teamId, channel, userAlias, bot, user, message) {
    if (!userAlias) {
      return this.PromiseToRemove(teamId, channel, userAlias, bot, user,message);
    } else {
      return HttpClient.validateAlias(
        this.teamConfigService,
        teamId,
        userAlias
      ).then(() => this.PromiseToRemove(teamId, channel, userAlias, bot, user,message));
    }
  }

  PromiseToRemove(teamId, channel, userAlias, bot, user ,message) {
    let teamConfiguration;
    let alias = userAlias;
    return this.teamConfigService
      .getDefault(teamId)
      .then(configuration =>
        !userAlias?HttpClient.validateConfiguration(configuration):configuration)
      .then(validTeamConfiguration => {
        teamConfiguration = validTeamConfiguration;
        if (!alias) {
          alias = teamConfiguration.getAlias();
        }
        return this.teamConfigService.getAccountForChannel(teamId, channel);
      })
      .then(accountConfiguration => {
        if (!userAlias && accountConfiguration) {
          alias = accountConfiguration.getAlias();
        }
        return alias;
      })
      .then(()=>{
        if(teamConfiguration.config.alias === alias){
          return this.teamConfigService.numberOfAccounts(teamId)
        }
      })
      .then(numberOfAccounts =>
        this.ConfirmRemove(teamConfiguration, alias, bot, user, teamId,numberOfAccounts,message)
      );
  }

  ConfirmRemove(teamConfiguration, alias, bot, user, teamId, numberOfAccounts,message) {
    let noAlias = alias === undefined;
    let canDeleteDefault = false;
    if (noAlias || teamConfiguration.config.alias === alias) {
      if (noAlias) {
        alias = 'This';
      }
      let deleteDefaultMessage;
      if(numberOfAccounts === 1){
        canDeleteDefault = true;
        deleteDefaultMessage = Messages.YOU_ARE_ABOUT_TO_REMOVE_LAST_ACCOUNT;
        const messageWithButtons = getMessageWithButtons(deleteDefaultMessage,true);
        this.askForApproval(alias, bot, user, teamId, messageWithButtons, true, canDeleteDefault);
      }else{
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
                const messageWithButtons = getMessageWithButtons(`${alias}${shouldDeleteAccountWithCurrentChannels}${channelNames}.${areYouSure}`);
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
            const messageWithButtons = getMessageWithButtons(`${shouldDeleteAccount}${alias}`);
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

  askForApproval(
    alias,
    bot,
    user,
    teamId,
    messageWithButtons,
    shouldDeleteDefault,
    canDeleteDefault
  ) {
    const teamConfigService = this.teamConfigService;
    bot.startPrivateConversation({ user }, (err, convo) => {
      convo.addMessage(
        {
          text: Messages.REMOVED_ACCOUNT_MESSAGE
        },
        'successfully_removed_thread'
      );

      convo.addMessage(
        {
          text: Messages.I_WONT_REMOVE_ACCOUNT
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
