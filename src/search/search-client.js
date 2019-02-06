class SearchClient {

  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  search(channelId, teamId, query, alias) {
    return this.httpClient.post(channelId, teamId, '/v1/search', query, alias);
  }

}

module.exports = SearchClient;
