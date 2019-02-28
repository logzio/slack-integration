const HttpClient = require('../../core/client/http-client');
const ApiExtract = require('../../core/utils/apiExtract');
const shouldDeleteDefaultAccountQuestion =
  ' is your workspace account. Are you sure you want to remove it from Slack?';
const shouldDeleteAccountWithCurrentChannels = ' is used in these channels:';
const areYouSure = ' Are you sure you want to remove it from Slack?';
const shouldDeleteAccount = 'Are you sure you want to remove ';

function getMessageWithButtons(prefix, question, suffix) {
  return {
    attachments: [
      {
        title: '',
        text: prefix + question + suffix,
        callback_id: 'remove-account',
        attachment_type: 'default',
        delete_original: true,
        actions: [
          {
            text: 'Remove',
            value: 'yes',
            type: 'button',
            name: 'yes'
          },
          {
            text: 'Cancel',
            value: 'no',
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

  removeAccount(teamId, channel, userAlias, bot, user) {
    if (!userAlias) {
      return this.PromiseToRemove(teamId, channel, userAlias, bot, user);
    } else {
      return HttpClient.validateAlias(
        this.teamConfigService,
        teamId,
        userAlias
      ).then(() => this.PromiseToRemove(teamId, channel, userAlias, bot, user));
    }
  }

  PromiseToRemove(teamId, channel, userAlias, bot, user) {
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
      .then(alias =>
        this.ConfirmRemove(teamConfiguration, alias, bot, user, teamId)
      );
  }

  ConfirmRemove(teamConfiguration, alias, bot, user, teamId) {
    let noAlias = alias === undefined;
    if (noAlias || teamConfiguration.config.alias === alias) {
      if (noAlias) {
        alias = 'This';
      }

      const messageWithButtons = getMessageWithButtons(
        alias,
        shouldDeleteDefaultAccountQuestion,
        ''
      );
      this.askForApproval(alias, bot, user, teamId, messageWithButtons, true);
    } else {
      this.teamConfigService
        .getAliasAccountsUsedByChannel(teamId, alias)
        .then(accounts => {
          if (accounts.length > 0) {
            ApiExtract.extractAccountsChannels(bot, accounts).then(
              channelNames => {
                const messageWithButtons = getMessageWithButtons(
                  alias,
                  shouldDeleteAccountWithCurrentChannels,
                  channelNames + '.' + areYouSure
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
              '',
              shouldDeleteAccount,
              alias
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

  askForApproval(
    alias,
    bot,
    user,
    teamId,
    messageWithButtons,
    shouldDeleteDefault
  ) {
    const teamConfigService = this.teamConfigService;
    bot.startPrivateConversation({ user }, (err, convo) => {
      convo.addMessage(
        {
          text: `Okay, I removed ${alias} from Slack.`
        },
        'successfully_removed_thread'
      );

      convo.addMessage(
        {
          text: `Okay, ${alias} is still active.`
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
            pattern: 'yes',
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
            pattern: 'no',
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
