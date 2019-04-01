function filterAlertsByName(alerts, alertName) {
  let filteredAlerts = alerts.filter(alert =>
    alert.title.toLowerCase().includes(alertName.toLowerCase())
  );
  filteredAlerts.alias = alerts.alias;
  return filteredAlerts;
}

class AlertsClient {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  getAlertByName(channelId, teamId, alertName, alias) {
    return this.httpClient
      .get(channelId, teamId, '/v1/alerts', alias)
      .then(alerts =>
        alertName ? filterAlertsByName(alerts, alertName) : alerts
      )
      .then(matchedAlerts => {
        if (matchedAlerts.length === 0) {
          throw new Error(`Unable to find alert with title ${alertName}`);
        }
        return matchedAlerts;
      });
  }

  getAlertById(channelId, teamId, alertId, alias) {
    return this.httpClient.get(
      channelId,
      teamId,
      `/v1/alerts/${alertId}`,
      alias
    );
  }

  getTriggeredAlerts(
    alias,
    channelId,
    teamId,
    size,
    severity,
    sortBy,
    sortOrder
  ) {
    const body = {
      from: 0,
      size,
      severity,
      sortBy,
      sortOrder
    };

    return this.httpClient.post(
      channelId,
      teamId,
      '/v1/alerts/triggered-alerts',
      body,
      alias
    );
  }
}

module.exports = AlertsClient;
