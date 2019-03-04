const LoggerFactory = require('../../core/logging/logger-factory');
const TeamConfiguration = require('../../core/configuration/team-configuration');
const {getEventMetadata} = require('../../core/logging/logging-metadata');
const Messages = require('../../core/messages/messages');

const logger = LoggerFactory.getLogger(__filename);

function validateConfigurationAndGetErrorsIfInvalid(
  configuredRegions,
  accountRegion,
  apiToken,
  alias
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

  const aliasErrors = validateAlias(alias);
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

function validateAlias(alias) {
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
  constructor(teamConfigService, httpClient, apiConfig, setupDialogSender) {
    this.teamConfigService = teamConfigService;
    this.httpClient = httpClient;
    this.configuredRegions = apiConfig['regions'];
    this.setupDialogSender = setupDialogSender;
  }

  configure(controller) {
    controller.on('dialog_submission', async (bot, message) => {
      let onRejected = err => {
        bot.reply(
          message,
          "Yikes! I'm not sure what happened, but I couldn't save your configuration. Please try again, and contact [Support](mailto:help@logz.io) if this keeps happening."
        );
        logger.error(
          `Failed to save configuration for team ${message.teamId} (${
            message.domain
            })`,
          err,
          getEventMetadata(message.raw_message, 'configuration_change_failed')
        );
      };

      if (message.callback_id === 'setup_alias_for_current_dialog') {
        const submission = message['submission'];
        const alias = submission['alias'];
        const configErrors = validateAlias(alias);
        if (configErrors.length > 0) {
          bot.dialogError(configErrors);
        } else {
          const rawMessage = message.raw_message;
          const team = rawMessage.team;
          this.teamConfigService
            .saveDefaultAlias(team.id, alias)
            .then(() => {
              bot.reply(
                message,
                `Okay, you're ready to use ${alias} in Slack!`
              );
              bot.dialogOk();
            })
            .catch(onRejected);
        }
        return;
      } else if (
        message.callback_id !== 'setup_dialog' &&
        message.callback_id !== 'initialization_setup_dialog'
      )
        return;

      const submission = message['submission'];
      const {alias, apiToken, accountRegion} = submission;

      const configErrors = validateConfigurationAndGetErrorsIfInvalid(
        this.configuredRegions,
        accountRegion,
        apiToken,
        alias
      );
      if (configErrors) {
        bot.dialogError(configErrors);
        bot.dialogOk();
      } else {
        this.httpClient.getRealName(apiToken, accountRegion).then(realName => {
          const configErrors = validateRealNameAndGetErrorsIfInvalid(realName);
          if (configErrors) {
            bot.dialogError(configErrors);
          } else {
            realName = realName.accountName;
            const rawMessage = message.raw_message;
            const team = rawMessage.team;
            this.teamConfigService
              .getDefault(team.id)
              .then(config => {
                let hasNoDefault = config.getRealName() === undefined || (config.config.alias === alias && config.config.apiToken !== apiToken);
                config = new TeamConfiguration({accountRegion, apiToken, alias, realName});
                const user = rawMessage.user;
                return this.teamConfigService
                  .addAccount(team.id, config)
                  .then(() => {
                    bot.reply(
                      message,
                      `Okay, you're ready to use ${alias} in Slack!`,
                      err => {
                        if (
                          !err &&
                          message.callback_id === 'initialization_setup_dialog'
                        ) {
                          //   bot.reply(message, `Seems like this is the first configured account, to set it as default account just type <@${bot.identity.id}> set workspace account ${alias}`);
                          bot.reply(
                            message,
                            `If you want to learn what I can do, just type <@${
                              bot.identity.id
                            }> help.`
                          ); // , () => sendUsage(bot, message, ''));
                        }
                      }
                    );
                    logger.info(
                      `Configuration for team ${team.id} (${
                        team.domain
                      }) changed by user ${user.id} (${user.name})`,
                      getEventMetadata(rawMessage, 'configuration_changed')
                    );

                    if (hasNoDefault) {
                      //first one or missing
                      this.teamConfigService.saveDefault(team.id, config);
                    }
                    bot.dialogOk();
                  });
              })
              .catch(err => {
                logger.error(err);
                return sendInvalidConfigurationError(bot);
              });
          }
        });
      }
    });
  }

  getRealName(token, region) {
    this.httpClient.getRealName(token, region);
  }
}

module.exports = AddAccountDialogHandler;
