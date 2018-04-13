const Command = require('../core/commands/command');
const CommandsRegistry = require('../core/commands/commands-registry');

function createListOfCategoryAndUsagePairs(command) {
  const pairs = [];
  const category = command.getCategory();

  const commandUsage = command.getUsage();
  if (typeof commandUsage === 'string') {
    pairs.push({ category, usage: commandUsage });
  } else {
    commandUsage.forEach(usageLine => pairs.push({ category, usage: usageLine }));
  }

  return pairs;
}

function isCategoryOrUsageMatchQuery(categoryUsagePair, query) {
  const normalizedCategory = categoryUsagePair.category.toLocaleLowerCase();
  const normalizedUsage = categoryUsagePair.usage.toLocaleLowerCase();
  const normalizedQuery = query.toLowerCase();

  return normalizedCategory.includes(normalizedQuery) || normalizedUsage.includes(normalizedQuery);
}

class HelpCommand extends Command {

  configure(controller) {
    controller.hears([/help/, /help [\w-]+/], 'direct_message,direct_mention', function (bot, message) {
      let query = '';
      const matches = message.text.match(/help ([\w\-]+)/);
      if (matches !== null) {
        query = matches[1];
      }

      const usageLines = [];
      const allCommandsPairs = [];
      CommandsRegistry.getCommands()
        .map(createListOfCategoryAndUsagePairs)
        .forEach(pairs => allCommandsPairs.push(...pairs));

      allCommandsPairs.filter(categoryUsagePair => isCategoryOrUsageMatchQuery(categoryUsagePair, query))
        .map(categoryUsagePair => categoryUsagePair.usage)
        .forEach(usageLine => usageLines.push(usageLine));

      if (usageLines.length === 0) {
        bot.reply(message, `No available commands match ${query}`);
        return;
      }

      bot.reply(message, usageLines.join('\n'));
    });

  }

  getCategory() {
    return 'help';
  }

  getUsage() {
    return [
      '*help* - Displays all available help commands.',
      '*help &lt;query&gt;* - Displays all help commands that match &lt;query&gt;.',
    ];
  }

}

module.exports = HelpCommand;
