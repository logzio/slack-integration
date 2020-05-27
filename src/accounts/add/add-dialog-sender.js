const LoggerFactory = require('../../core/logging/logger-factory');
const logger = LoggerFactory.getLogger(__filename);

const title = 'Important: You’ll give all users access to Logz.io';
const question =
  'If you add this account, all workspace users can see information on the account, even if they can’t sign in to Logz.io. Do you still want to add the account?';

const messageWithButtons = {
  attachments: [
    {
      title: title,
      text: question,
      callback_id: 'should_open_setup_dialog',
      attachment_type: 'default',
      delete_original: true,
      actions: [
        {
          text: 'Add the account',
          value: 'add-yes',
          type: 'button',
          name: 'answer'
        },
        {
          text: 'Never mind',
          value: 'add-no',
          type: 'button',
          name: 'answer'
        }
      ]
    }
  ]
};

const messageWithoutButtons = {
  response_type: 'ephemeral',
  attachments: [
    {
      title: title,
      text: question
    }
  ]
};

function maskApiToken(logzioApiToken) {
  if (!logzioApiToken) {
    return '';
  }

  if (logzioApiToken.length < 6) {
    return '*'.repeat(logzioApiToken.length);
  }

  const charsToMask = logzioApiToken.length - 6;
  return '*'.repeat(charsToMask) + logzioApiToken.substring(charsToMask);
}

function createSelectableRegionList(apiConfig) {
  const configuredRegions = apiConfig['regions'];
  const selectableRegionList = [];
  Object.keys(configuredRegions).sort().forEach(function (region) {
    if (configuredRegions[region]) {
      selectableRegionList.push({
        label: configuredRegions[region]['name'],
        value: region
      });
    }
  });
  return selectableRegionList;
}

function buildAndSendConfigurationDialog(
  bot,
  selectableRegionList,
  reply,
  config,
  callback_id
) {
  const accountRegion = config.getLogzioAccountRegion();
  const apiToken = maskApiToken(config.getLogzioApiToken());

  const dialog = bot
    .createDialog('Logz.io Configuration', callback_id, 'Save')
    .addSelect(
      'Account region',
      'accountRegion',
      accountRegion,
      selectableRegionList
    )
    .addText('API Token', 'apiToken', null, {
      placeholder: apiToken,
      hint:
        'Create an API token in your Logz.io Enterprise account or email help@logz.io to request one.'
    })
    .addText('Alias', 'alias', null, {
      placeholder: '',
      hint:
        'A Slack alias for your Logz.io account. (Letters, numbers, hyphens, and underscores only.)'
    });

  bot.replyWithDialog(reply, dialog.asObject(), err => {
    if (err) {
      logger.error('Unknown error while replying with dialog', err);
    }
  });
}

class AddAccountDialogSender {
  constructor(teamConfigurationService, apiConfig) {
    this.teamConfigurationService = teamConfigurationService;
    this.selectableRegionList = createSelectableRegionList(apiConfig);
  }

  sendSetupMessage(bot, user, isInitializationPhase) {
    logger.debug("sendSetupMessage"+isInitializationPhase);
    bot.startPrivateConversation({ user }, (err, convo) => {
      logger.debug("startPrivateConversation"+isInitializationPhase);
      convo.addMessage(
        {
          text: `Okay, I won't add an account now. When you're ready, just type ${
            bot.identity.name
          } add account.`
        },
        'canceled'
      );

      convo.addQuestion(
        messageWithButtons,
        [
          {
            pattern: 'add-yes',
            callback: (reply, convo) => {
              this.replayWithDialogSetup(
                reply,
                convo,
                bot,
                isInitializationPhase
              );
            }
          },
          {
            pattern: 'add-no',
            callback: (reply, convo) => {
              convo.gotoThread('canceled');
            }
          },
          {
            default: true,
            callback: (reply, convo) => {
              convo.gotoThread('canceled');
            }
          }
        ],
        {},
        'default'
      );
      convo.activate();
    });
  }

  replayWithDialogSetup(reply, convo, bot, isInitializationPhase) {
    this.teamConfigurationService.getDefault(reply.team.id).then(config => {
      convo.stop();
      bot.replyInteractive(reply, messageWithoutButtons);
      buildAndSendConfigurationDialog(
        bot,
        this.selectableRegionList,
        reply,
        config,
        isInitializationPhase ? 'initialization_setup_dialog' : 'setup_dialog'
      );
    });
  }
}

module.exports = AddAccountDialogSender;
