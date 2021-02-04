const TeamNotConfiguredError = require('../errors/team-not-configured-error');
const RateLimitExceededError = require('../errors/rate-limit-exceeded-error');
const AliasNotExistError = require('../errors/alias-not-exist-error');
const Messages = require('../../core/messages/messages');

class Command {
  getCategory() {
    throw new Error('Method `getCategory` must be overridden!');
  }

  getUsage() {
    throw new Error('Method `getUsage` must be overridden!');
  }

  async handleError(bot, userMessage, err, unknownErrorHandler) {
    if (err instanceof TeamNotConfiguredError) {
      await bot.reply(userMessage, Messages.LOFZ_IO_IS_NOT_CONFIGURED);
    } else if (
      err instanceof RateLimitExceededError ||
      err instanceof AliasNotExistError
    ) {
      await bot.reply(userMessage, err.message);
    } else {
      await unknownErrorHandler(err);
    }
  }
}

module.exports = Command;
