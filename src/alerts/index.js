const { httpClient } = require('../core/client');
const AlertsClient = require('./alerts-client');
const TriggeredAlertsCommand = require('./triggered-alerts-command');
const ShowAlertsCommand = require('./show-alert-command');

const alertsClient = new AlertsClient(httpClient);
const triggeredAlertsCommand = new TriggeredAlertsCommand(alertsClient);
const showAlertsCommand = new ShowAlertsCommand(alertsClient);

module.exports = { triggeredAlertsCommand, showAlertsCommand };
