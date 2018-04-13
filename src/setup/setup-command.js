const Command = require('../core/commands/command');
const LoggerFactory = require('../core/logging/logger-factory');
const TeamConfiguration = require('../core/configuration/team-configuration');
const { getEventMetadata } = require('../core/logging/logging-metadata');

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

function createSelectableRegionList(configuredRegions) {
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
    .addText('API Token', 'apiToken', apiToken);

  bot.replyWithDialog(reply, dialog.asObject(), (err) => {
    if (err) {
      logger.error('Unknown error while replying with dialog', err);
    }
  });
}

class SetupCommand extends Command {

  constructor(apiConfig, teamConfigurationService) {
    super();
    this.configuredRegions = apiConfig['regions'];
    this.selectableRegionList = createSelectableRegionList(this.configuredRegions);
    this.teamConfigurationService = teamConfigurationService;
  }

  configure(controller) {
    const configuredRegions = this.configuredRegions;
    const selectableRegionList = this.selectableRegionList;
    const teamConfigService = this.teamConfigurationService;

    controller.hears('setup', 'direct_message,direct_mention', function (bot, message) {
      if (message.type !== 'direct_message') {
        bot.reply(message, `<@${message.user}> sending you the configuration options privately.`);
      }

      bot.startPrivateConversation(message, function(err, convo) {
        convo.ask(messageWithButtons, [{
          pattern: 'yes',
          callback: (reply, convo) => {
            teamConfigService.get(reply.team.id)
              .then(config => {
                convo.stop();
                bot.replyInteractive(reply, messageWithoutButtons);
                buildAndSendConfigurationDialog(bot, selectableRegionList, reply, config);
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
    });

    controller.on('dialog_submission', (bot, message) => {
      if (message.callback_id !== 'setup_dialog') return;

      const submission = message['submission'];

      const accountRegion = submission['accountRegion'];
      const apiToken = submission['apiToken'];

      if (!configuredRegions.hasOwnProperty(accountRegion)) {
        bot.dialogError({
          name: 'accountRegion',
          error: 'Invalid account region.'
        });

        return;
      }

      if (!apiToken || apiToken.trim() === '') {
        bot.dialogError({
          name: 'apiToken',
          error: 'Api token cannot be blank.'
        });

        return;
      }

      const config = new TeamConfiguration()
        .setLogzioAccountRegion(accountRegion)
        .setLogzioApiToken(apiToken);

      const rawMessage = message.raw_message;
      const team = rawMessage.team;
      const user = rawMessage.user;

      teamConfigService.save(team.id, config)
        .then(() => {
          bot.reply(message, 'Configuration saved!');
          logger.info(`Configuration for team ${team.id} (${team.domain}) changed by user ${user.id} (${user.name})`,
            getEventMetadata(rawMessage, 'configuration_changed'));
        })
        .catch(err => {
          bot.reply(message, 'Unknown error occurred while saving configuration, please try again later or contact support.');
          logger.error(`Failed to save configuration for team ${team.id} (${team.domain})`, err,
            getEventMetadata(rawMessage, 'configuration_change_failed'));
        });

      bot.dialogOk();
    });
  }

  getCategory() {
    return 'setup';
  }

  getUsage() {
    return [
      '*setup* - Displays setup dialog.',
    ];
  }

}

module.exports = SetupCommand;
