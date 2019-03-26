const Messages = {
  WRONG_API_TOKEN: "This API token isn't valid. Try again with another token.",
  BLANk_API_TOKEN: "API token can't be blank.",
  LOFZ_IO_IS_NOT_CONFIGURED:
    'Logz.io integration is not configured!\n' +
    'Use `add account` command to configure the Logz.io integration and try again.',

  DEFAULT_ERROR_MESSAGE:
    'Sorry, something went wrong. Please try one more time, or contact the Support team if this happens again.',
  THERE_IS_NO_ACCOUNT_WITH_THAT_ALIAS:
    "Sorry, there isn't an account with that alias. If you want to see your accounts, type `@Alice accounts`.",

  NO_ACCOUNTS_YET:
    "You haven't added any accounts yet. To add one, type @Alice add account",

  getResults: (alias) => `Getting results from \`${alias}\`\n`,

  REMOVED_ACCOUNT_MESSAGE: 'Okay, I removed the account. When you\'re ready to use Logz.io in Slack again, type `add account`.',
  YOU_ARE_ABOUT_TO_REMOVE_LAST_ACCOUNT: '✋ *You\'re about to remove your last Logz.io account from Slack.*\nAre you sure you want to remove it?',
  I_WONT_REMOVE_ACCOUNT:  `Okay, I won't remove the account. Carry on. 🙂`,
  CANT_REMOVE_DEFAULT_ACCOUNT :'⛔️ That\'s your default workspace account. I can\'t remove it until you set another account as the workspace account.\n'

};

module.exports = Messages;
