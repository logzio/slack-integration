class removeAccountHandler {
  constructor(teamConfigService, httpClient){
    this.teamConfigService = teamConfigService;
    this.httpClient = httpClient;
  }

  removeAccount(teamId, alias) {
    let confService = this.teamConfigService;
    confService.removeAccount(teamId, alias)
  }

}


module.exports = removeAccountHandler;
