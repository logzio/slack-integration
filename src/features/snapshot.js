const { snapshotCommand } = require('../snapshots');

const commandWithAlias = /(.+) snapshot (vis|visualization|dash|dashboard) (.*) last (\d+) ?(minutes?|mins?|m|hours?|h)( query (.+))?\s*$/;
const command = /snapshot (vis|visualization|dash|dashboard) (.*) last (\d+) ?(minutes?|mins?|m|hours?|h)( query (.+))?\s*$/;

module.exports = function(controller) {
  controller.hears(
    [commandWithAlias],
    'direct_message,direct_mention',
    (bot, message) => {
      snapshotCommand.createSnapshot(null, message, bot, true);
    }
  );

  controller.hears(
    [command],
    'direct_message,direct_mention',
    (bot, message) => {
      snapshotCommand.createSnapshot(message.channel, message, bot, false);
    }
  );
};
