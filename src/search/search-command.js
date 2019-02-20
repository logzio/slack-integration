const Command = require('../core/commands/command');
const LoggerFactory = require('../core/logging/logger-factory');
const QueryBuilder = require('./query-builder');
const TimeUnit = require('../core/time/time-unit');
const { getEventMetadata } = require('../core/logging/logging-metadata');

const searchWithDefaultWindow                = /search `(.+)`\s*$/;
const searchWithDefaultWindowWithAlias       = /(.+) search `(.+)`\s*$/;
const searchWithTimeToSearch                 = /search `(.+)` last (\d+) ?(minutes?|mins?|m|hours?|h)\s*$/;
const searchWithTimeToSearchWithAlias        = /(.+) search `(.+)` last (\d+) ?(minutes?|mins?|m|hours?|h)\s*$/;
const searchWithSpecificTimeWindow           = /search `(.+)` from (.+) to (.+)\s*$/;
const searchWithSpecificTimeWindowWithAlias  = /(.+) search `(.+)` from (.+) to (.+)\s*$/;
const searchWithDefaultWindowEscape                = /search \u034f`(.+)`\s*$/;
const searchWithDefaultWindowWithAliasEscape       = /(.+) search \u034f`(.+)`\s*$/;
const searchWithTimeToSearchEscape                 = /search \u034f`(.+)` last (\d+) ?(minutes?|mins?|m|hours?|h)\s*$/;
const searchWithTimeToSearchWithAliasEscape        = /(.+) search \u034f`(.+)` last (\d+) ?(minutes?|mins?|m|hours?|h)\s*$/;
const searchWithSpecificTimeWindowEscape           = /search \u034f`(.+)` from (.+) to (.+)\s*$/;
const searchWithSpecificTimeWindowWithAliasEscape  = /(.+) search \u034f`(.+)` from (.+) to (.+)\s*$/;

const logger = LoggerFactory.getLogger(__filename);

function runSearchAndSendResults(command, bot, message, query, attachmentTitle, alias) {
  command.searchClient.search(message.channel, message.team, query, alias)
    .then(searchResult => {
      bot.api.files.upload({
        content: JSON.stringify(searchResult, null, 2),
        channels: message.channel,
        filename: attachmentTitle,
        filetype: 'javascript'
      }, err => {
        if (err) {
          logger.error('Failed to send query results', err);
        }
      });
    })
    .catch(err => {
      command.handleError(bot, message, err, err => {
        bot.reply(message, 'Unknown error occurred while performing your search.\n' +
          'Please try again later or contact support.');
        logger.error(`Unknown error occurred while performing user search: [${JSON.stringify(query)}]`, err);
      });
    });
}

class SearchCommand extends Command {

  constructor(searchClient) {
    super();
    this.searchClient = searchClient;
  }

  configure(controller) {

    controller.hears([searchWithDefaultWindowWithAlias,searchWithDefaultWindowWithAliasEscape], 'direct_message,direct_mention', (bot, message) => {
      this.searchWithDefaultWindow(message, bot, true);
    });

    controller.hears([searchWithDefaultWindow,searchWithDefaultWindowEscape], 'direct_message,direct_mention', (bot, message) => {
      this.searchWithDefaultWindow(message, bot, false);
    });

    controller.hears([searchWithTimeToSearchWithAlias,searchWithTimeToSearchWithAliasEscape], 'direct_message,direct_mention', (bot, message) => {
      this.searchWithTimeToSearch(message, bot, true);
    });

    controller.hears([searchWithTimeToSearch,searchWithTimeToSearchEscape], 'direct_message,direct_mention', (bot, message) => {
      this.searchWithTimeToSearch(message, bot, false);
    });

    controller.hears([searchWithSpecificTimeWindowWithAlias,searchWithSpecificTimeWindowWithAliasEscape], 'direct_message,direct_mention', (bot, message) => {
      this.searchWithSpecificTimeWindow(message, bot, true)
    });

    controller.hears([searchWithSpecificTimeWindow,searchWithSpecificTimeWindowEscape], 'direct_message,direct_mention', (bot, message) => {
      this.searchWithSpecificTimeWindow(message, bot, false)
    });
  }

  searchWithSpecificTimeWindow(message, bot, withAlias) {
    logger.info(`User ${message.user} from team ${message.team} triggered a search with absolute time frame`, getEventMetadata(message, 'search'));
    const matches = message.match;
    let alias,queryString,fromTS,toTS;
    let index = 1;
    if(withAlias){
      alias = matches[index++];
    }
    queryString = matches[index++];
    fromTS = matches[index++];
    toTS = matches[index];
    const query = new QueryBuilder()
      .withQueryString(queryString)
      .withExactTime(fromTS, toTS)
      .build();

    runSearchAndSendResults(this, bot, message, query, `Search results for query: \`${queryString}\``, alias );
  }

  searchWithTimeToSearch(message, bot, withAlias) {
    logger.info(`User ${message.user} from team ${message.team} triggered a search with relative time frame`, getEventMetadata(message, 'search'));
    const matches = message.match;

    let alias,queryString,timeValue,timeUnitStr;
    let index = 1;
    if(withAlias){
      alias = matches[index++];
    }
    queryString = matches[index++];
    timeValue = matches[index++];
    timeUnitStr = matches[index];

    const query = new QueryBuilder()
      .withQueryString(queryString)
      .withRelativeTime(timeValue, TimeUnit.parse(timeUnitStr))
      .build();

    runSearchAndSendResults(this, bot, message, query, `Search results for query: \`${queryString}\``,alias);
  }

  searchWithDefaultWindow(message, bot, withAlias) {
    logger.info(`User ${message.user} from team ${message.team} triggered a search with default time frame`, getEventMetadata(message, 'search'));
    const matches = message.match;
    let alias,queryString;
    let index = 1;
    if(withAlias){
      alias = matches[index++];
    }
    queryString = matches[index];
    const query = new QueryBuilder()
      .withQueryString(queryString)
      .build();
    runSearchAndSendResults(this, bot, message, query, `Search results for query: \`${queryString}\``,alias);
  }

  getCategory() {
    return 'search';
  }

  getUsage() {
    return [
      '*search \u034f`&lt;query-string&gt;`* - Get the query results for the last 15 minutes\n\tExample: _search ͏`*͏`_',
      '*search \u034f`&lt;query-string&gt;` last &lt;time-value&gt; &lt;time-unit&gt;* - Get the query results for the last _x_ minutes or hours\n\tExample: _search ͏`*͏` last',
      '*search \u034f`&lt;query-string&gt;` from &lt;from-timestamp&gt; to &lt;to-timestamp&gt;* - Get the query results between the start and end times\n\tExample: _search ͏`*͏` from 2019-02-17T13:01:46.000Z to 2019-02-17T13:01:06.057+0000_',
    ];
  }

}

module.exports = SearchCommand;
