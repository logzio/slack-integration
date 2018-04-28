function filterAlertsByName(alerts, alertName) {
  return alerts.filter(alert => alert.title.toLowerCase().includes(alertName.toLowerCase()));
}

class AlertsClient {

  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  getAlertByName(teamId, alertName) {
    return this.httpClient.get(teamId, '/v1/alerts')
      .then(alerts => filterAlertsByName(alerts, alertName))
      .then(matchedAlerts => {
        if (matchedAlerts.length === 0) {
          throw new Error(`Unable to find alert with title ${alertName}`);
        }

        if (matchedAlerts.length > 1) {
          throw new Error(`There are multiple alerts with title ${alertName}`);
        }

        return matchedAlerts[0];
      });
  }

  getTriggeredAlerts(teamId, size, severity, sortBy, sortOrder) {
    const body = {
      from: 0,
      size,
      severity,
      sortBy,
      sortOrder
    };

    return this.httpClient.post(teamId, '/v1/alerts/triggered-alerts', body);
  }

}

module.exports = AlertsClient;
