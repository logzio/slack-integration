const Axios = require('axios');
const TeamNotConfiguredError = require('./team-not-configured-error');

const HttpMethod = {
  GET: 'GET',
  POST: 'POST',
};

function validateConfiguration(configuration) {
  if (!configuration.getLogzioAccountRegion()) {
    throw new TeamNotConfiguredError('Logz.io account region is not configured!');
  }

  if (!configuration.getLogzioApiToken()) {
    throw new TeamNotConfiguredError('Logz.io api token is not configured!');
  }

  return Promise.resolve(configuration);
}

function getAuthHeaders(token) {
  return {
    json: true,
    headers: {
      'X-USER-TOKEN': token,
      'X-API-TOKEN': token
    }
  };
}

function sendRequest(httpClient, teamId, method, path, body) {
  return httpClient.teamConfigurationService.get(teamId)
    .then(validateConfiguration)
    .then(configuration => {
      const accountRegion = configuration.getLogzioAccountRegion();
      const apiToken = configuration.getLogzioApiToken();

      const endpointUrl = httpClient.endpointResolver.getEndpointUrl(accountRegion, path);
      const authHeaders = getAuthHeaders(apiToken);

      let requestPromise;
      switch (method) {
        case HttpMethod.GET:
          requestPromise = Axios.get(endpointUrl, authHeaders);
          break;
        case HttpMethod.POST:
          requestPromise = Axios.post(endpointUrl, body, authHeaders);
          break;
        default:
          return Promise.reject(`Unsupported method ${method}!`);
      }

      return requestPromise
        .then(response => response.data);
    });
}

class HttpClient {

  constructor(teamConfigurationService, endpointResolver) {
    this.teamConfigurationService = teamConfigurationService;
    this.endpointResolver = endpointResolver;
  }

  get(teamId, path) {
    return sendRequest(this, teamId, HttpMethod.GET, path);
  }

  post(teamId, path, body) {
    return sendRequest(this, teamId, HttpMethod.POST, path, body);
  }

}

module.exports = HttpClient;
