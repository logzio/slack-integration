const LoggerFactory = require('../../core/logging/logger-factory');
const TeamConfiguration = require('../../core/configuration/team-configuration');
const { getEventMetadata } = require('../../core/logging/logging-metadata');
const Messages = require('../../core/messages/messages');
const apiConfig = require('../../../conf/api');
const { teamConfigurationService } = require('../../core/configuration');
const { httpClient } = require('../../core/client');

const logger = LoggerFactory.getLogger(__filename);

function validateConfigurationAndGetErrorsIfInvalid(
  configuredRegions,
  accountRegion,
  apiToken,
  alias,
  aliasExists
) {
  let errors = [];

  if (!configuredRegions[accountRegion]) {
    errors.push({
      name: 'accountRegion',
      error: 'Account region must be US or EU.'
    });
  }

  if (!apiToken || apiToken.trim() === '') {
    errors.push({
      name: 'apiToken',
      error: Messages.BLANk_API_TOKEN
    });
  }

  const aliasErrors = validateAlias(alias, aliasExists);
  errors.push(...aliasErrors);
  return errors.length > 0 ? errors : null;
}

function validateRealNameAndGetErrorsIfInvalid(realName) {
  let errors = [];
  if (!realName.accountName) {
    errors.push({
      name: 'apiToken',
      error: Messages.WRONG_API_TOKEN
    });
  }
  return errors.length > 0 ? errors : null;
}

function validateAlias(alias, aliasExists) {
  const errors = [];
  if (!alias || alias.trim() === '') {
    errors.push({
      name: 'alias',
      error: "Alias can't be blank"
    });
  } else if (alias.match(/[!$%^&*()+|~=`{}[\]:/;<>?,.@# ]/)) {
    errors.push({
      name: 'alias',
      error:
        'This field can contain only letters, numbers, hyphens, and underscores.'
    });
  } else if (aliasExists) {
    errors.push({
      name: 'alias',
      error:
        'An account is already using this alias. Try again with a different alias.'
    });
  }
  return errors;
}

function sendInvalidConfigurationError(bot) {
  bot.dialogError([
    {
      name: 'Configuration error',
      error:
        "I couldn't connect to your account. Please double-check your API token and region, and try again. If that doesn't fix the problem, email [Support](mailto:help@logz.io)."
    }
  ]);
}

class AddAccountDialogHandler {
  constructor(setupDialogSender) {
    this.configuredRegions = apiConfig['regions'];
    this.setupDialogSender = setupDialogSender;
  }

  configure(controller) {
    controller.on('dialog_submission', async (bot, message) => {
      logger.info("dialog_submission:"+ message.callback_id);
      if (
        message.callback_id !== 'setup_dialog' &&
        message.callback_id !== 'initialization_setup_dialog'
      ) {
        return;
      }
      const submission = message['submission'];
      const { alias, apiToken, accountRegion } = submission;
      teamConfigurationService
        .getAccountForAlias(alias, message.raw_message.team.id)
        .then(aliasExists => {
          const configErrors = validateConfigurationAndGetErrorsIfInvalid(
            this.configuredRegions,
            accountRegion,
            apiToken,
            alias,
            aliasExists
          );
          if (configErrors) {
            logger.info("configErrors:"+configErrors[0].error);
            bot.dialogError(configErrors);
            bot.dialogOk();
            return;
          }
          return httpClient
            .getRealName(apiToken, accountRegion)
            .then(realName => {
              const configErrors = validateRealNameAndGetErrorsIfInvalid(
                realName
              );
              if (configErrors) {
                logger.info("configErrors:"+configErrors[0].error);
                bot.dialogError(configErrors);
                return;
              }
              realName = realName.accountName;
              const { team = null, user = null } = message.raw_message;
              teamConfigurationService
                .getDefault(team.id)
                .then(defaultConfig =>
                  this.addAccount(
                    accountRegion,
                    apiToken,
                    alias,
                    realName,
                    team,
                    bot,
                    message,
                    user,
                    defaultConfig
                  )
                )
                .catch(err => {
                  logger.error(err);
                  return sendInvalidConfigurationError(bot);
                });
            });
        });
    });
  }

  addAccount(
    accountRegion,
    apiToken,
    alias,
    realName,
    team,
    bot,
    message,
    user,
    defaultConfig
  ) {
    let config = new TeamConfiguration({
      accountRegion,
      apiToken,
      alias,
      realName
    });
    return teamConfigurationService.addAccount(team.id, config).then(() => {
      this.botReplayWithSetupDialog(bot, message, alias);
      logger.info(
        `Configuration for team ${team.id} (${team.domain}) changed by user ${
          user.id
        } (${user.name})`,
        getEventMetadata(message.raw_message, 'configuration_changed')
      );

      if (this.hasNoDefaultWorkspace(defaultConfig, alias, apiToken)) {
        //first one or missing
        teamConfigurationService.saveDefault(team.id, config);
      }
      bot.dialogOk();
    });
  }

  hasNoDefaultWorkspace(config, alias, apiToken) {
    return (
      config.getRealName() === undefined ||
      (config.config.alias === alias && config.config.apiToken !== apiToken)
    );
  }

  botReplayWithSetupDialog(bot, message, alias) {
    bot.reply(message, `Okay, you're ready to use ${alias} in Slack!`, err => {
      if (!err && message.callback_id === 'initialization_setup_dialog') {
        bot.reply(
          message,
          `If you want to learn what I can do, just type <@${
            bot.identity.id
          }> help.`
        );
      }
    });
  }

  getRealName(token, region) {
    return httpClient.getRealName(token, region);
  }
}

module.exports = AddAccountDialogHandler;
