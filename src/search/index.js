const { httpClient } = require('../core/client');
const SearchClient = require('./search-client');
const SearchCommand = require('./search-command');

const searchClient = new SearchClient(httpClient);
const searchCommand = new SearchCommand(searchClient);

module.exports = { searchClient, searchCommand };
