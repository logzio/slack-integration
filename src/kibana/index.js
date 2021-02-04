const { httpClient } = require('../core/client');
const KibanaClient = require('./kibana-client');
const KibanaObjectsCommand = require('./kibana-objects-command');

const kibanaClient = new KibanaClient(httpClient);
const kibanaObjectsCommand = new KibanaObjectsCommand(kibanaClient);

module.exports = { kibanaClient, kibanaObjectsCommand };
