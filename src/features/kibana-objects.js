const { kibanaObjectsCommand } = require('../kibana');

const commandRegex = /get kibana (objects|vis|visualizations?|dash|dashboards?|search|searches)/;
const commandRegexWithAlias = /(.+) get kibana (objects|vis|visualizations?|dash|dashboards?|search|searches)/;

module.exports = function(controller) {
  controller.hears(
    [commandRegexWithAlias],
    'direct_message,direct_mention',
    async (bot, message) => {
      await kibanaObjectsCommand.getKibanaObjects(message, bot, true);
    }
  );

  controller.hears(
    [commandRegex],
    'direct_message,direct_mention',
    async (bot, message) => {
      await kibanaObjectsCommand.getKibanaObjects(message, bot, false);
    }
  );
};
