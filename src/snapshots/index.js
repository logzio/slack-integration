const { httpClient } = require('../core/client');
const SnapshotClient = require('./snapshots-client');
const SnapshotCommand = require('./snapshot-command');
const { kibanaClient } = require('../kibana');
const BasicUp = require('../core/utils/basicUp');

const snapshotClient = new SnapshotClient(httpClient);
const externalDomain = BasicUp.getRequiredValueFromEnv('EXTERNAL_DOMAIN');
const snapshotCommand = new SnapshotCommand(
  externalDomain,
  kibanaClient,
  snapshotClient
);

module.exports = { snapshotClient, snapshotCommand };
