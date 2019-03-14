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
    "You haven't added any accounts yet. To add one, type @Alice add account"
};

module.exports = Messages;
