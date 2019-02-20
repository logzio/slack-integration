const Command = require('../../core/commands/command');
const LoggerFactory = require('../../core/logging/logger-factory');
const logger = LoggerFactory.getLogger(__filename);
const util = require('util');
class GetAccountsCommand extends Command {

  constructor(teamConfigService) {
    super();
    this.teamConfigService = teamConfigService;
  }

  configure(controller) {
    controller.hears(/accounts/, 'direct_message,direct_mention', (bot, message) => {
      return this.teamConfigService.getAllAccountsSafeView(message.team, bot)
        .then(allAccountsSafeView => {
          let accountsString = 'These are the accounts in this workspace:\n'+ allAccountsSafeView.map(item => {
              let channelNames = item.channels.length > 0 ? ` This is the channel account for ` +
                item.channels.map(channel =>
                  `<#${channel.channelId}|${channel.channelName}>`).join(", ") +'.' : '';
              let isDefaultAccount = item.isDefault ? ' *This is the default workspace account.*' : '';
              return `• \`${item.accountAlias}\`: Slack alias for ${item.accountName}.${isDefaultAccount}${channelNames}\n`
            }
          ).join("");
          bot.reply(message, allAccountsSafeView.length === 0 ? "You haven't added any accounts yet. To add one, type @Alice add account" : accountsString);
        }).catch(err => logger.error(err));
    });
  }

  getCategory() {
    return 'list accounts';
  }

  getUsage() {
    return [
      '*accounts* - List the Logz.io accounts in this workspace',
    ];
  }
}

module.exports = GetAccountsCommand;
