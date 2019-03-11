const Command = require('../../core/commands/command');
const LoggerFactory = require('../../core/logging/logger-factory');
const logger = LoggerFactory.getLogger(__filename);
class GetAccountsCommand extends Command {
  constructor(teamConfigService) {
    super();
    this.teamConfigService = teamConfigService;
  }

  configure(controller) {
    controller.hears(
      /accounts/,
      'direct_message,direct_mention',
      (bot, message) => {
        return this.teamConfigService
          .getAllAccountsSafeView(message.team, bot)
          .then(allAccountsSafeView => this.replayWith(allAccountsSafeView, bot, message))
          .catch(err => logger.error(err));
      }
    );
  }

  replayWith(allAccountsSafeView, bot, message) {
    bot.reply(
      message,
      allAccountsSafeView.length === 0
        ? "You haven't added any accounts yet. To add one, type @Alice add account"
        : createAccountsViewReply(allAccountsSafeView)
    );
  }

  getCategory() {
    return 'list accounts';
  }

  getUsage() {
    return ['*accounts* - List the Logz.io accounts in this workspace'];
  }
}

function createChannelNames(item) {

  if (item.channels.length === 0) {
    return '';
  }
  const hasPrivateChannel = item.channels.some(channel => channel.isPrivate);
  const channelMap = item.channels.map(
    channel => {
      if (!channel.isPrivate) {
        return `<#${channel.channelId}|${channel.channelName}>`
      }
    }
  ).filter(x => typeof x === 'string' && x.length > 0);
  const channelMapPrefix = ` This is the channel account for ` + channelMap.join(',');
  if (hasPrivateChannel) {
    return channelMapPrefix + (channelMap.length > 0 ? ', ' : '') + 'one or more private channels' + '.';
  } else {
    return channelMapPrefix + '.';
  }
}

function createAccountDescription(item) {
  return `• \`${item.accountAlias}\`: Slack alias for ${item.accountName}.${defaultSuffixIfDefault(item.isDefault)}${createChannelNames(item)}\n`;
}

function defaultSuffixIfDefault(isDefault) {
  return isDefault ? ' *This is the default workspace account.*' : '';
}

function createAccountsViewReply(allAccountsSafeView) {

  return 'These are the accounts in this workspace:\n' +
    allAccountsSafeView.map(item => createAccountDescription(item)).join('');
}

module.exports = GetAccountsCommand;
