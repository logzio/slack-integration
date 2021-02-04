const { showAlertsCommand } = require('../alerts');

const commandShowByIdWithAlias = /(.+) (get) alert by id (\d*)/;
const commandShowById = /(get) alert by id (\d*)/;
const commandShowByNameWithAlias = /(.+) (get) alert (.*)/;
const commandShowByName = /(get) alert (.*)/;
const commandShowAll = /(get) alerts/;
const commandShowAllWithAlias = /(.+) (get) alerts/;

module.exports = function(controller) {
  controller.hears(
    [commandShowAllWithAlias],
    'direct_message,direct_mention',
    (bot, message) => {
      showAlertsCommand.getAllAlerts(message.channel, message, bot, true);
    }
  );

  controller.hears(
    [commandShowAll],
    'direct_message,direct_mention',
    (bot, message) => {
      showAlertsCommand.getAllAlerts(message.channel, message, bot, false);
    }
  );

  controller.hears(
    [commandShowByIdWithAlias],
    'direct_message,direct_mention',
    (bot, message) => {
      showAlertsCommand.showAlertById(null, message, bot, true);
    }
  );

  controller.hears(
    [commandShowById],
    'direct_message,direct_mention',
    (bot, message) => {
      showAlertsCommand.showAlertById(message.channel, message, bot, false);
    }
  );

  controller.hears(
    [commandShowByNameWithAlias],
    'direct_message,direct_mention',
    (bot, message) => {
      showAlertsCommand.showAlertByName(null, message, bot, true);
    }
  );

  controller.hears(
    [commandShowByName],
    'direct_message,direct_mention',
    (bot, message) => {
      showAlertsCommand.showAlertByName(message.channel, message, bot, false);
    }
  );
};
