const Command = require('../core/commands/command');
const LoggerFactory = require('../core/logging/logger-factory');
const Table = require('easy-table');
const { getEventMetadata } = require('../core/logging/logging-metadata');

const logger = LoggerFactory.getLogger(__filename);

const commandRegex = /get kibana (objects|vis|visualizations?|dash|dashboards?|search|searches)/;
const commandRegexWithAlias = /(.+) get kibana (objects|vis|visualizations?|dash|dashboards?|search|searches)/;
class KibanaObjectsCommand extends Command {
  constructor(kibanaClient) {
    super();
    this.kibanaClient = kibanaClient;
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
    logger.info(
      `User ${message.user} from team ${
        message.team
      } requested kibana objects list`,
      getEventMetadata(message, 'get-kibana-objects')
    );

    const matches = message.match;
    let alias, objectType;
    if (withAlias) {
      alias = matches[1];
      objectType = matches[2].toLocaleLowerCase();
    } else {
      objectType = matches[1].toLocaleLowerCase();
    }

    let objectTypes = ['dashboard', 'visualization', 'search'];
    switch (objectType) {
      case 'vis':
      case 'visualization':
      case 'visualizations':
        objectTypes = ['visualization'];
        break;
      case 'dash':
      case 'dashboard':
      case 'dashboards':
        objectTypes = ['dashboard'];
        break;
      case 'search':
      case 'searches':
        objectTypes = ['search'];
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
        const table = new Table();

        results.forEach(objects => {
          objects.forEach(kibanaObject => {
            table.cell('Object Type', kibanaObject['_type']);
            table.cell('Object Name', kibanaObject['_source']['title']);
            table.newRow();
          });
        });

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
                getEventMetadata(
                  message,
                  'failed_to_send_kibana_objects_table'
                ),
                err
              );
            }
          }
        );
      })
      .catch(err => {
        this.handleError(bot, message, err, err => {
          logger.error(
            'Failed to send kibana objects table',
            getEventMetadata(message, 'failed_to_get_kibana_objects'),
            err
          );
        });
      });
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
