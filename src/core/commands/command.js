const TeamNotConfiguredError = require('../errors/team-not-configured-error');
const RateLimitExceededError = require('../errors/rate-limit-exceeded-error');
const AliasNotExistError = require('../errors/alias-not-exist-error');
const Messages = require('../../core/messages/messages');

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

  handleError(bot, userMessage, err, unknownErrorHandler, defaultError) {
    if (err instanceof TeamNotConfiguredError) {
      bot.reply(userMessage, Messages.LOFZ_IO_IS_NOT_CONFIGURED);
    } else if (
      err instanceof RateLimitExceededError ||
      err instanceof AliasNotExistError
    ) {
      bot.reply(userMessage, err.message);
    } else if (defaultError) {
      bot.reply(userMessage, Messages.DEFAULT_ERROR_MESSAGE);
      unknownErrorHandler(err);
    } else {
      unknownErrorHandler(err);
    }
  }
}

module.exports = Command;
