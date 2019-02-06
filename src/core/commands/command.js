const TeamNotConfiguredError = require('../errors/team-not-configured-error');
const RateLimitExceededError = require('../errors/rate-limit-exceeded-error');
const AliasNotExistError = require('../errors/alias-not-exist-error');

class Command {

  configure(controller) {
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
      bot.reply(userMessage, 'Logz.io integration is not configured!\n' +
        'Use `setup` command to configure the Logz.io integration and try again.');
    }
    else if (err instanceof RateLimitExceededError || err instanceof AliasNotExistError) {
          bot.reply(userMessage, err.message);
    }else if(defaultError){
      bot.reply(userMessage, 'Sorry, something went wrong. Please try one more time, or contact the Support team if this happens again.');
      unknownErrorHandler(err);
    }
    else {
      unknownErrorHandler(err);
    }
  }

}

module.exports = Command;
