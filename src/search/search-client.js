class SearchClient {

  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  search(channelId, teamId, query) {
    return this.httpClient.post(channelId, teamId, '/v1/search', query);
  }

}

module.exports = SearchClient;
