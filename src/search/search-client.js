class SearchClient {

  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  search(teamId, query) {
    return this.httpClient.post(teamId, '/v1/search', query);
  }

}

module.exports = SearchClient;
