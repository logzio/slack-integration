const Command = require('../core/commands/command');
const LoggerFactory = require('../core/logging/logger-factory');
const Table = require('easy-table');
const { getEventMetadata } = require('../core/logging/logging-metadata');
const Messages = require('../core/messages/messages');

const logger = LoggerFactory.getLogger(__filename);

const commandRegex = /get kibana (objects|vis|visualizations?|dash|dashboards?|search|searches)/;
const commandRegexWithAlias = /(.+) get kibana (objects|vis|visualizations?|dash|dashboards?|search|searches)/;
class KibanaObjectsCommand extends Command {
  constructor(kibanaClient) {
    super();
    this.kibanaClient = kibanaClient;
    this.teamConfigurationService =
      kibanaClient.httpClient.teamConfigurationService;
  }

  configure(controller) {
    controller.hears(
      [commandRegexWithAlias],
      'direct_message,direct_mention',
      (bot, message) => {
        this.getKibanaObjects(message, bot, true);
      }
    );
    controller.hears(
      [commandRegex],
      'direct_message,direct_mention',
      (bot, message) => {
        this.getKibanaObjects(message, bot, false);
      }
    );
  }

  getKibanaObjects(message, bot, withAlias) {
    this.reportCommandWithCompanyName({
      userObject: message,
      eventName: 'get-kibana-objects',
      action: 'requested kibana objects list',
      logger,
      teamConfigurationService: this.teamConfigurationService
    });
    const matches = message.match;
    let alias, objectType;
    if (withAlias) {
      alias = matches[1];
      objectType = matches[2].toLocaleLowerCase();
    } else {
      objectType = matches[1].toLocaleLowerCase();
    }

    let objectsToPrint = 'objects';
    let objectTypes = ['dashboard', 'visualization', 'search'];
    switch (objectType) {
      case 'vis':
      case 'visualization':
      case 'visualizations':
        objectTypes = ['visualization'];
        objectsToPrint = 'visualizations';
        break;
      case 'dash':
      case 'dashboard':
      case 'dashboards':
        objectTypes = ['dashboard'];
        objectsToPrint = 'dashboards';
        break;
      case 'search':
      case 'searches':
        objectTypes = ['search'];
        objectsToPrint = 'searches';
        break;
    }

    const promises = objectTypes.map(objectType =>
      this.kibanaClient.listObjects(
        message.channel,
        message.team,
        objectType,
        alias
      )
    );
    Promise.all(promises)
      .then(results => {
        if (!this.hasResults(results)) {
          bot.reply(
            message,
            `There aren’t any ${objectsToPrint} in that account.`
          );
        } else {
          const table = new Table();
          results.forEach(objects => {
            objects.forEach(kibanaObject => {
              table.cell('Object Type', kibanaObject['_type']);
              table.cell('Object Name', kibanaObject['_source']['title']);
              table.newRow();
            });
          });
          bot.reply(message, Messages.getResults(results[0].alias), () =>
            this.replayWithKibanaTable(bot, table, message, objectTypes)
          );
        }
      })
      .catch(err => {
        this.handleError(bot, message, err, err => {
          logger.error(
            'Failed to send kibana objects table',
            getEventMetadata({
              message,
              eventName: 'failed_to_get_kibana_objects'
            }),
            err
          );
        });
      });
  }

  replayWithKibanaTable(bot, table, message, objectTypes) {
    bot.api.files.upload(
      {
        content: table.toString(),
        channels: message.channel,
        filename: `Kibana objects of the following types: ${objectTypes.join(
          ', '
        )}`,
        filetype: 'text'
      },
      err => {
        if (err) {
          logger.error(
            'Failed to send kibana objects table',
            getEventMetadata({
              message,
              eventName: 'failed_to_send_kibana_objects_table'
            }),
            err
          );
        }
      }
    );
  }

  hasResults(results) {
    let hasResults = false;
    const size = results.length;
    let i = 0;
    while (i < size && !hasResults) {
      if (results[i].length > 0) {
        hasResults = true;
      }
      i++;
    }
    return hasResults;
  }

  getCategory() {
    return 'kibana';
  }

  getUsage() {
    return [
      '*[&lt;alias&gt;] get kibana &lt;objects|dashboards|visualizations|searches&gt;* - List Kibana objects, dashboards, visualizations, or searches'
    ];
  }
}

module.exports = KibanaObjectsCommand;
