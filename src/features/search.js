const { searchCommand } = require('../search');

const searchWithDefaultWindow = /search `(.+)`\s*$/;
const searchWithDefaultWindowWithAlias = /(.+) search `(.+)`\s*$/;
const searchWithTimeToSearch = /search `(.+)` last (\d+) ?(minutes?|mins?|m|hours?|h)\s*$/;
const searchWithTimeToSearchWithAlias = /(.+) search `(.+)` last (\d+) ?(minutes?|mins?|m|hours?|h)\s*$/;
const searchWithSpecificTimeWindow = /search `(.+)` from (.+) to (.+)\s*$/;
const searchWithSpecificTimeWindowWithAlias = /(.+) search `(.+)` from (.+) to (.+)\s*$/;
const searchWithDefaultWindowEscape = /search \u034f`(.+)`\s*$/;
const searchWithDefaultWindowWithAliasEscape = /(.+) search \u034f`(.+)`\s*$/;
const searchWithTimeToSearchEscape = /search \u034f`(.+)` last (\d+) ?(minutes?|mins?|m|hours?|h)\s*$/;
const searchWithTimeToSearchWithAliasEscape = /(.+) search \u034f`(.+)` last (\d+) ?(minutes?|mins?|m|hours?|h)\s*$/;
const searchWithSpecificTimeWindowEscape = /search \u034f`(.+)` from (.+) to (.+)\s*$/;
const searchWithSpecificTimeWindowWithAliasEscape = /(.+) search \u034f`(.+)` from (.+) to (.+)\s*$/;

module.exports = function(controller) {
  controller.hears(
    [searchWithDefaultWindowWithAlias, searchWithDefaultWindowWithAliasEscape],
    'direct_message,direct_mention',
    (bot, message) => {
      searchCommand.searchWithDefaultWindow(message, bot, true);
    }
  );

  controller.hears(
    [searchWithDefaultWindow, searchWithDefaultWindowEscape],
    'direct_message,direct_mention',
    (bot, message) => {
      searchCommand.searchWithDefaultWindow(message, bot, false);
    }
  );

  controller.hears(
    [searchWithTimeToSearchWithAlias, searchWithTimeToSearchWithAliasEscape],
    'direct_message,direct_mention',
    (bot, message) => {
      searchCommand.searchWithTimeToSearch(message, bot, true);
    }
  );

  controller.hears(
    [searchWithTimeToSearch, searchWithTimeToSearchEscape],
    'direct_message,direct_mention',
    (bot, message) => {
      searchCommand.searchWithTimeToSearch(message, bot, false);
    }
  );

  controller.hears(
    [
      searchWithSpecificTimeWindowWithAlias,
      searchWithSpecificTimeWindowWithAliasEscape
    ],
    'direct_message,direct_mention',
    (bot, message) => {
      searchCommand.searchWithSpecificTimeWindow(message, bot, true);
    }
  );

  controller.hears(
    [searchWithSpecificTimeWindow, searchWithSpecificTimeWindowEscape],
    'direct_message,direct_mention',
    (bot, message) => {
      searchCommand.searchWithSpecificTimeWindow(message, bot, false);
    }
  );
};
