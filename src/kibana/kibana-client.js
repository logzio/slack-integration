const LoggerFactory = require('../core/logging/logger-factory');
const logger = LoggerFactory.getLogger(__filename);

class KibanaClient {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  listObjects(channelId, teamId, objectType, alias) {
    const body = {
      type: objectType
    };

    return this.httpClient
      .post(channelId, teamId, '/v1/kibana/export', body, alias)
      .then(data => this.kibanaObjects(data));
  }

  kibanaObjects(queryResult) {
    const kibanaVersion = queryResult['kibanaVersion'];
    logger.info('Current account kibana version: ', kibanaVersion);
    if (kibanaVersion === '4.0.0-beta3') {
      return queryResult['hits'];
    }

    const kibanaObjects = queryResult['hits'];
    const kibanaObjectsMap = kibanaObjects.map(kibanaObject => this.createObject(kibanaObject));
    kibanaObjectsMap.alias = queryResult.alias;
    return kibanaObjectsMap;
  }

  createObject(object) {
    const type = object['_source']['type'];
    const objectTitle = object['_source'][type]['title'];
    const objectId = object['_id'].split(':')[1];
    return {
      _type: type,
      _id: objectId,
      _source: {
        title: objectTitle
      }
    };
  }
}

module.exports = KibanaClient;
