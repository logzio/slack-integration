const Command = require('../core/commands/command');
const LoggerFactory = require('../core/logging/logger-factory');
const moment = require('moment');
const Table = require('easy-table');
const TimeUnit = require('../core/time/time-unit');
const { getEventMetadata } = require('../core/logging/logging-metadata');

const logger = LoggerFactory.getLogger(__filename);

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

function sendSnapshotRequest(snapshotsClient, externalDomain, bot, message, objectType, objectId, fromTS, toTS, query) {
  const webhookUrl = `${externalDomain}/webhook/${message.team}/${message.channel}`;
  const queryWithFixedQuotes = query.replace('”', '"').replace('“', '"');
  snapshotsClient.createSnapshot(message.team, message.user, objectType, objectId, fromTS, toTS, queryWithFixedQuotes, webhookUrl)
    .then(() => {
      bot.reply(message, 'Snapshot request has been sent.')
    })
    .catch(err => {
      logger.warn('Failed to send snapshot request', err, getEventMetadata(message, 'failed-to-send-snapshot-request'));
      bot.reply(message, 'Failed to send snapshot request');
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
    controller.hears([/snapshot (vis|visualization|dash|dashboard) (.*) last (\d+) ?(minutes?|mins?|m|hours?|h)( query (.+))?\s*$/], 'direct_message,direct_mention', (bot, message) => {
      const matches = message.match;
      const objectType = getKibanaObjectType(matches[1]);
      const objectName = matches[2];

      const timeFrame = matches[3];
      const timeUnit = TimeUnit.parse(matches[4]);

      const nowUtc = moment().utc();
      const toTS = nowUtc.format();
      const fromTS = nowUtc.subtract(timeUnit.toMillis(timeFrame), 'ms').format();

      const query = matches[6] || '*';

      this.kibanaClient.listObjects(message.team, objectType)
        .then(kibanaObjects => filterObjectsByIdOrName(kibanaObjects, objectName))
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
          sendSnapshotRequest(this.snapshotsClient, this.externalDomain, bot, message, objectType, objectId, fromTS, toTS, query);
        });
    });
  }

  getCategory() {
    return 'snapshot';
  }

  getUsage() {
    return [
      '*snapshot &lt;dashboard|visualization&gt; &lt;object-name&gt; last &lt;time-value&gt; &lt;time-unit&gt;* - Create a snapshot of the requested object',
      '*snapshot &lt;dashboard|visualization&gt; &lt;object-name&gt; last &lt;time-value&gt; &lt;time-unit&gt; query &lt;query-string&gt;* - Create a snapshot of the requested object'
    ];
  }

}

module.exports = SnapshotCommand;
