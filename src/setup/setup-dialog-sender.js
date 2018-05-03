const LoggerFactory = require('../core/logging/logger-factory');

const logger = LoggerFactory.getLogger(__filename);

const title = 'Configure your Logz.io integration with Slack';
const question = 'Do you want to (re)configure your Logz.io integration?';

const messageWithButtons = {
  attachments: [
    {
      title: title,
      text: question,
      callback_id: 'should_open_setup_dialog',
      attachment_type: 'default',
      delete_original: true,
      actions: [{
        text: 'Yes',
        value: 'yes',
        type: 'button',
        name: 'answer',
      }, {
        text: 'No',
        value: 'no',
        type: 'button',
        name: 'answer',
      }]
    }
  ]
};

const messageWithoutButtons = {
  response_type: "ephemeral",
  attachments: [{
    title: title,
    text: question
  }]
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
  for (const region in configuredRegions) {
    if (!configuredRegions.hasOwnProperty(region)) continue;

    selectableRegionList.push({
      label: configuredRegions[region]['name'],
      value: region
    });
  }

  return selectableRegionList;
}

function buildAndSendConfigurationDialog(bot, selectableRegionList, reply, config) {
  const accountRegion = config.getLogzioAccountRegion() || 'us-east-1';
  const apiToken = maskApiToken(config.getLogzioApiToken());

  const dialog = bot.createDialog('Logz.io Configuration', 'setup_dialog', 'Save')
    .addSelect('Account region', 'accountRegion', accountRegion, selectableRegionList)
    .addText('API Token', 'apiToken', null, { placeholder: apiToken });

  bot.replyWithDialog(reply, dialog.asObject(), (err) => {
    if (err) {
      logger.error('Unknown error while replying with dialog', err);
    }
  });
}

class SetupDialogSender {

  constructor(teamConfigurationService, apiConfig) {
    this.teamConfigurationService = teamConfigurationService;
    this.selectableRegionList = createSelectableRegionList(apiConfig);
  }

  sendSetupMessage(bot, user) {
    bot.startPrivateConversation({ user }, (err, convo) => {
      convo.ask(messageWithButtons, [{
        pattern: 'yes',
        callback: (reply, convo) => {
          this.teamConfigurationService.get(reply.team.id)
            .then(config => {
              convo.stop();
              bot.replyInteractive(reply, messageWithoutButtons);
              buildAndSendConfigurationDialog(bot, this.selectableRegionList, reply, config);
            });
        }
      }, {
        default: true,
        callback: (reply, convo) => {
          convo.stop();
          bot.replyInteractive(reply, messageWithoutButtons);
        }
      }]);
    });
  }

}

module.exports = SetupDialogSender;
