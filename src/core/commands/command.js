const TeamNotConfiguredError = require('../errors/team-not-configured-error');
const RateLimitExceededError = require('../errors/rate-limit-exceeded-error');
const AliasNotExistError = require('../errors/alias-not-exist-error');
const Messages = require('../../core/messages/messages');
const { logEvent } = require('../../core/logging/logging-service');

class Command {
  configure() {
    throw new Error('Method `configure` must be overridden!');
  }

  getCategory() {
    throw new Error('Method `getCategory` must be overridden!');
  }

  getUsage() {
    throw new Error('Method `getUsage` must be overridden!');
  }

  handleError(bot, userMessage, err, unknownErrorHandler) {
    if (err instanceof TeamNotConfiguredError) {
      bot.reply(userMessage, Messages.LOFZ_IO_IS_NOT_CONFIGURED);
    } else if (
      err instanceof RateLimitExceededError ||
      err instanceof AliasNotExistError
    ) {
      bot.reply(userMessage, err.message);
    } else {
      unknownErrorHandler(err);
    }
  }

  async reportCommandWithCompanyName({
    userObject,
    action,
    eventName,
    logger,
    teamConfigurationService
  }) {
    const teamId =
      typeof userObject.team === 'string'
        ? userObject.team
        : userObject.team.id;
    const companyName = await teamConfigurationService.getCompanyNameForTeamId(
      teamId
    );
    logEvent({ userObject, eventName, logger, companyName, action });
  }
}

module.exports = Command;
