const HttpClient = require('./http-client');
const EndpointResolver = require('./endpoint-resolver');
const apiConfig = require('../../../conf/api');

const endpointResolver = new EndpointResolver(apiConfig);
const httpClient = new HttpClient(endpointResolver);

module.exports = { httpClient };
