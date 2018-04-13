class KibanaClient {

  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  listObjects(teamId, objectType) {
    const body = {
      type: objectType
    };

    return this.httpClient.post(teamId, '/v1/kibana/export', body)
      .then(data => data['hits']);
  }

}

module.exports = KibanaClient;
