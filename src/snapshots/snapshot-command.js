const Command = require('../core/commands/command');
const LoggerFactory = require('../core/logging/logger-factory');
const moment = require('moment');
const Table = require('easy-table');
const TimeUnit = require('../core/time/time-unit');
const { getEventMetadata } = require('../core/logging/logging-metadata');

const logger = LoggerFactory.getLogger(__filename);
const commandWithAlias = /(.+) snapshot (vis|visualization|dash|dashboard) (.*) last (\d+) ?(minutes?|mins?|m|hours?|h)( query (.+))?\s*$/;
const command = /snapshot (vis|visualization|dash|dashboard) (.*) last (\d+) ?(minutes?|mins?|m|hours?|h)( query (.+))?\s*$/;

function getKibanaObjectType(objectTypeStr) {
  switch (objectTypeStr) {
    case 'vis':
    case 'visualization':
      return 'visualization';
    case 'dash':
    case 'dashboard':
      return 'dashboard';
  }
}

function filterObjectsByIdOrName(kibanaObjects, filter) {
  const lowerCaseFilter = filter.toLowerCase();
  return kibanaObjects.filter(kibanaObject => {
    return kibanaObject['_id'].toLowerCase().includes(lowerCaseFilter)
     || kibanaObject['_source']['title'].toLowerCase().includes(lowerCaseFilter);
  })
}

function sendMatchedKibanaObjectsTable(bot, message, objectType, matchedKibanaObjects) {
  const table = new Table();
  matchedKibanaObjects.forEach(kibanaObject => {
    table.cell('ID', kibanaObject['_id']);
    table.cell('Name', kibanaObject['_source']['title']);
    table.newRow();
  });

  bot.reply(message, `There are multiple ${objectType}s with the specified name or id, please refine you request.`);
  bot.api.files.upload({
    content: table.toString(),
    channels: message.channel,
    filename: `Kibana ${objectType}s matching your request`,
    filetype: 'text'
  }, err => {
    if (err) {
      logger.error('Failed to send kibana objects table', getEventMetadata(message, 'failed_to_send_kibana_objects'), err);
    }
  });
}

function sendSnapshotRequest(snapshotsClient, externalDomain, bot, message, objectType, objectId, fromTS, toTS, query, alias) {
  const webhookUrl = `${externalDomain}/webhook/${message.team}/${message.channel}`;
  const queryWithFixedQuotes = query.replace('”', '"').replace('“', '"');
  logger.info(`sendSnapshotRequest: ${message.channel},${message.user},${queryWithFixedQuotes},${webhookUrl}`);
  return snapshotsClient.createSnapshot(message.channel, message.team, message.user, objectType, objectId, fromTS, toTS, queryWithFixedQuotes, webhookUrl, alias)
    .then((data) => {
      if(data.errorCode === undefined){
        bot.reply(message, 'Snapshot request has been sent.')
      }else{
        throw Error();
      }
    });
}

class SnapshotCommand extends Command {

  constructor(externalDomain, kibanaClient, snapshotsClient) {
    super();
    this.externalDomain = externalDomain;
    this.kibanaClient = kibanaClient;
    this.snapshotsClient = snapshotsClient;
  }

  configure(controller) {

    controller.hears([commandWithAlias], 'direct_message,direct_mention', (bot, message) => {
      this.createSnapshot(null, message, bot, true);
    });

    controller.hears([command], 'direct_message,direct_mention', (bot, message) => {
      this.createSnapshot(message.channel,message, bot, false);
    });
  }

  createSnapshot(channel, message, bot, withAlias) {
    logger.info(`User ${message.user} from team ${message.team} requested a snapshot`, getEventMetadata(message, 'create-snapshot'));
    const matches = message.match;
    let alias,objectType,objectName,timeFrame,timeUnit;
    let index = 1;
    if(withAlias){
      alias = matches[index++];
    }
    objectType = getKibanaObjectType(matches[index++]);
    objectName = matches[index++];
    timeFrame = matches[index++];
    timeUnit = TimeUnit.parse(matches[index]);

        const nowUtc = moment().utc();
        const toTS = nowUtc.format();
        const fromTS = nowUtc.subtract(timeUnit.toMillis(timeFrame), 'ms').format();
        const query = matches[6] || '*';

        this.kibanaClient.listObjects(channel, message.team, objectType, alias)
          .then(kibanaObjects =>
            filterObjectsByIdOrName(kibanaObjects, objectName))
          .then(matchedKibanaObjects => {
            if (matchedKibanaObjects.length === 0) {
              bot.reply(message, `Unable to find ${objectType} with the specified name`);
              return;
            }

            if (matchedKibanaObjects.length > 1) {
              sendMatchedKibanaObjectsTable(bot, message, objectType, matchedKibanaObjects);
              return;
            }

            const objectId = matchedKibanaObjects[0]['_id'];
            return sendSnapshotRequest(this.snapshotsClient, this.externalDomain, bot, message, objectType, objectId, fromTS, toTS, query, alias);
          })

      .catch(err => {
        this.handleError(bot, message, err, err => {
          logger.warn('Failed to send snapshot request', err, getEventMetadata(message, 'failed-to-send-snapshot-request'));
          bot.reply(message, 'Failed to send snapshot request');
        });
      });
  }

  getCategory() {
    return 'snapshot';
  }

  getUsage() {
    return [
      '*snapshot &lt;dashboard|visualization&gt; &lt;object-name&gt; last &lt;time-value&gt; &lt;time-unit&gt;* - Create a snapshot of a dashboard or visualization',
      '*snapshot &lt;dashboard|visualization&gt; &lt;object-name&gt; last &lt;time-value&gt; &lt;time-unit&gt; query &lt;query-string&gt;* - Create a snapshot of a dashboard or visualization'
    ];
  }

}

module.exports = SnapshotCommand;
