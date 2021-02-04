const commandWithAlias = /(.+) (get|list) triggered alerts/;
const command = /(get|list) triggered alerts/;
const events = 'direct_message,direct_mention';

const { triggeredAlertsService } = require('../alerts');

module.exports = function(controller) {
  controller.hears([commandWithAlias], events, async (bot, message) => {
    await triggeredAlertsService.getTriggeredAlerts(null, bot, message, true);
  });
  controller.hears([command], events, async (bot, message) => {
    await triggeredAlertsService.getTriggeredAlerts(
      message.channel,
      bot,
      message,
      null,
      false
    );
  });
};
