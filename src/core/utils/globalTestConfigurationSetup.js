const findFreePort = require("find-free-port");
const JasmineHttpServerSpy = require('jasmine-http-server-spy');
const TeamConfiguration = require('../../core/configuration/team-configuration');
const TeamConfigurationService = require('../../core/configuration/team-configuration-service');
const SnapshotsClient = require('../../snapshots/snapshots-client');
const HttpClient = require('../client/http-client');
const DBUtils = require('../utils/basicUp');
const LogzStorageMySQL = require('../storage/logzio-storage');
const mysql = require('mysql');
const Botmock = require('botkit-mock');
const SnapshotCommand = require('../../snapshots/snapshot-command');
const LoggerFactory = require('../logging/logger-factory');
const logger = LoggerFactory.getLogger(__filename);
const util = require('util');
const apiConfig = require('../../../conf/api');
const EndpointResolver = require('../client/endpoint-resolver');
const CommandName = require('../../tests/CommandName');
const SetupDialogSender = require('../../accounts/add/add-dialog-sender');
const SetupDialogHander = require('../../accounts/add/add-account-dialog-handler');
const AddAccountCommand = require('../../accounts/add/add-account-command');
const GetAccountsCommand = require('../../accounts/get/get-accounts-command');
const LogzioBot = require('../../logzio-bot');

const AlertsClient = require('../../alerts/alerts-client');
const GetTriggeredAlertsCommand = require('../../alerts/get-triggered-alerts-command');


const ChannelAccountHandler = require('../../accounts/channel/channel-account-handler');
const ClearActiveCommand = require('../../accounts/channel/clear-channel-account-command');
const SetChannelAccountCommand = require('../../accounts/channel/set-channel-account-command');

const SetDefaultCommand = require('../../accounts/default/set-default-command');
const DefaultHandler = require('../../accounts/default/default-handler');
const RemoveAccountCommand = require('../../accounts/remove/remove-command');
const RemoveAccountHandler = require('../../accounts/remove/remove-account-handler');


class GlobalTestConfigurationSetup {

  constructor() {
    this.openChannelId = 'openc1';
  }

  async beforeAll(jasmineSpyHandlers,jasmineSpyHandlerReturnValues,fn) {
    await this.setupGeneralTestConfigurations(jasmineSpyHandlers, jasmineSpyHandlerReturnValues,fn);
  }

  async setupGeneralTestConfigurations(jasmineSpyHandlers, jasmineSpyHandlerReturnValues, fn) {

    this.dbConfig = {
      user: DBUtils.getRequiredValueFromEnv('MYSQL_USER'),
      password: DBUtils.getRequiredValueFromEnv('MYSQL_PASSWORD'),
      host: DBUtils.getRequiredValueFromEnv('MYSQL_HOST'),
    };
    this.storage = await this.createTestStorage(this.dbConfig);
    this.teamConfigurationService = new TeamConfigurationService(this.storage);
    await this.saveDefaultTeams();
    this.port = await findFreePort(3000);
    this.externalDomain = `http://localhost:${this.port}`;
    apiConfig['regions']['us-east-1'].endpoint = this.externalDomain;
    apiConfig['regions']['eu-central-1'].endpoint = this.externalDomain;
    this.endpointResolver = new EndpointResolver(apiConfig);

    await this.setupSpyServer(jasmineSpyHandlers, jasmineSpyHandlerReturnValues, fn);
  }

  async setupSpyServer(jasmineSpyHandlers, jasmineSpyHandlerReturnValues, fn) {
    jasmineSpyHandlers.push(
      {
        method: 'get',
        url: '/v1/account-management/whoami',
        handlerName: 'whoami'
      })
    this.httpSpy = JasmineHttpServerSpy.createSpyObj('mockServer', jasmineSpyHandlers);
    this.handlers = [];

    jasmineSpyHandlerReturnValues['whoami'] = {}
    jasmineSpyHandlerReturnValues['whoami']['mixed-1-api-token'] = {
      statusCode: 200,
      body: {
        accountName: 'Logzio App Test 1 Prod'
      }
    }

    jasmineSpyHandlerReturnValues['whoami']['mixed-2-api-token'] = {
      statusCode: 200,
      body: {
        accountName: 'Logzio App Test 2 Prod'
      }
    }

    jasmineSpyHandlerReturnValues['whoami']['no-such-token'] = {
      statusCode: 200,
      body: {
        code: 403,
        message: "Insufficient privileges"
      }
    }

    if (fn) {
      for (let [i] in  jasmineSpyHandlers) {
        const handler = jasmineSpyHandlers[i];
        this.handlers.push(handler.handlerName);
        this.httpSpy[handler.handlerName].and.callFake((req) => {
          return jasmineSpyHandlerReturnValues[handler.handlerName][req.headers['x-api-token']]
        })
      }
    } else {

      for (let i = 0; i < jasmineSpyHandlers.length; i++) {
        let handler = jasmineSpyHandlers[i].handlerName;
        this.handlers.push(handler);
        this.httpSpy[handler].and.returnValue(jasmineSpyHandlerReturnValues[i]);
      }
    }
    await this.httpSpy.server.start(this.port[0]);
  }

  async saveDefaultTeams() {
    // const botTeams = [{
    //   "id": 'teamId66',
    //   "createdBy": 'userId',
    //   "url": "https://logzio.slack.com/",
    //   "name": "Test Logz IO Account",
    //   "state": "botkit",
    //   "bot": {
    //     "token": "bot-token",
    //     "user_id": 'userId',
    //     "createdBy": 'userId',
    //     "app_token": "app-token"
    //   },
    //   "token": "api-token"
    // }];
    //
    // for (let i = 0; i < botTeams.length; i++) {
    //   await this.storage.teams.save(botTeams[i]);
    //   const teamConfiguration = new TeamConfiguration()
    //     .setLogzioAccountRegion('us-east-1')
    //     .setLogzioApiToken('api-token')
    //     .setAlias('alis_' + botTeams[i].id)
    //     .setRealName('realName');
    //   await this.teamConfigurationService.saveDefault(botTeams[i].id, teamConfiguration);
    // }
  }

  afterAll(done){
    this.httpSpy.server.stop(done)
  }
  afterEach(){
    for(let i = 0; i < this.handlers.length; i++) {
      this.httpSpy[this.handlers[i]].calls.reset();
    }
  }

  async initBeforeEach(kibanaClient, commandType , migration) {
    this.controller = Botmock({});

    this.bot = this.controller.spawn({type: 'slack' , token:'token'});

         if(commandType === CommandName.SETUP) {
           this.prapareBotApiMock();

           const setupDialogSender = new SetupDialogSender(this.teamConfigurationService, apiConfig);
           this.command = new AddAccountCommand(setupDialogSender,this.teamConfigurationService);
           this.command.configure(this.controller);

           this.httpClient = new HttpClient(this.teamConfigurationService, this.endpointResolver);
           const setupDialogHandler = new SetupDialogHander(this.teamConfigurationService, this.httpClient, apiConfig, setupDialogSender);
           setupDialogHandler.configure(this.controller);

           const getAccounts = new GetAccountsCommand(this.teamConfigurationService);
           getAccounts.configure(this.controller);

           const alertsClient = new AlertsClient(this.httpClient);
           const getTriggers = new GetTriggeredAlertsCommand(alertsClient)
           getTriggers.configure(this.controller);

           const channelAccountHandler = new ChannelAccountHandler(this.teamConfigurationService);
           const setChannelAccountCommand = new SetChannelAccountCommand(channelAccountHandler);
           setChannelAccountCommand.configure(this.controller);

           const defaultHandler = new DefaultHandler(this.teamConfigurationService, this.httpClient);

           const setDefaultCommand = new SetDefaultCommand(defaultHandler);
           setDefaultCommand.configure(this.controller);

           const removeAccountHandler = new RemoveAccountHandler(this.teamConfigurationService, defaultHandler);
           const removeAccountCommand = new RemoveAccountCommand(removeAccountHandler)
           removeAccountCommand.configure(this.controller);

         }else if (commandType === CommandName.SNAPSHOT) {
           const snapshotsClient = this.createSnapshotClient();
           this.command = new SnapshotCommand(this.externalDomain, kibanaClient, snapshotsClient);
           this.command.configure(this.controller);

         }else{
           this.httpClient = new HttpClient(this.teamConfigurationService, this.endpointResolver);
         }

         if(!migration){
           await executeSqlStatement(this.dbConfig,"truncate table configured_accounts");
         }



  }

  async executeGoToVersionTwoMigration(){
    await executeSqlStatement(this.dbConfig,"delete from migrations where id > 3");
    await executeSqlStatement(this.dbConfig,"drop table configured_accounts");
  }

  prapareBotApiMock() {
    this.prapareApiImOpen();
    this.prapareApiDialog();
    this.prapareApiChannels();

    this.bot.dialogError = function (errors) {
      this.dialogErrors = errors;
    };

  }

  prapareApiImOpen() {
    this.bot.api.setData('im.open', {
      ok: true,
      channel: {
      id: this.openChannelId
    }
    });
  }

  prapareApiDialog() {
    this.bot.api.setData('dialog.open', {
      ok: true,
      channel: {
        id: this.openChannelId
      }
    });

    this.bot.api.setFilter('dialog.open', function (params) {
      params.ok = true;
      return params;
    });
  }

  prapareApiChannels() {
    let temp = this.bot.api.getData('channels.info');

    temp[this.openChannelId] = {
      "ok": true,
      "channel": {
        "id": this.openChannelId,
        "name": "someChannelId_name"
      }
    }

    temp['chan2'] = {
      "ok": true,
      "channel": {
        "id": "chan2",
        "name": "chan2_name"
      }
    }
    this.bot.api.setData('channels.info', temp);
  }

  createSnapshotClient() {
    this.httpClient = new HttpClient(this.teamConfigurationService, this.endpointResolver);
    return new SnapshotsClient(this.httpClient);
  }

   createKibanaClientMock(args) {
    return {
      listObjects: () => Promise.resolve(args)
    };
  }

  async mockFirstInstall(id,createdBy,name,region,token,appToken, apiToken,alias){

    const botTeam = {
      "id": `${id}`,
      "createdBy": `${createdBy}`,
      "url": "https://logzio.slack.com/",
      "name": `${name}`,
      "bot": {
        "token": `${token}`,
        "user_id": `${createdBy}`,
        "createdBy": `${createdBy}`,
        "app_token":`${appToken}`
      },
      "token": `${token}`
    };

    await this.storage.teams.save(botTeam);

    if(apiToken || region || alias){
      const teamConfiguration = new TeamConfiguration();
    if(apiToken) {
      teamConfiguration.setLogzioApiToken(apiToken);
    }

      if(region){
        teamConfiguration.setLogzioAccountRegion(region);
      }

      if(alias){
        teamConfiguration.setAlias(alias);
      }

      await this.teamConfigurationService.saveDefault(botTeam.id, teamConfiguration);
    }



  }

  async createTestStorage(dbConfig) {

    logger.info("createTestStorage:step1");
    await executeSqlStatement(dbConfig,"DROP DATABASE IF EXISTS logzbot_tests");
    await executeSqlStatement(dbConfig,"CREATE DATABASE logzbot_tests");
    logger.info("createTestStorage:finished");

    dbConfig.database = 'logzbot_tests';
    await DBUtils.migrateDatabase(dbConfig);
    this.storage =  new LogzStorageMySQL(dbConfig);

    return this.storage;

  }


  async mockFirstInstallForMigration(id,createdBy,name,region,token,appToken, apiToken){

    const botTeam = {
      "id": `${id}`,
      "createdBy": `${createdBy}`,
      "url": "https://logzio.slack.com/",
      "name": `${name}`,
      "bot": {
        "token": `${token}`,
        "user_id": `${createdBy}`,
        "createdBy": `${createdBy}`,
        "app_token":`${appToken}`,
        "name": `${name}`,
        "configuration": {
          "accountRegion":`${region}`,
          "apiToken":`${apiToken}`
        }
      },
      "token": `${token}`
    };

    await this.storage.teams.save(botTeam);
  }



}



const executeSqlStatement =  async function (config,statement) {
  var connection = mysql.createConnection(config);
  try {
    connection.connect();
    const queryPromise = util.promisify(connection.query).bind(connection);
    const ans = await queryPromise(statement);
    return  ans;
  } catch(err) {
    throw Error(err);
  } finally {
    connection.end();
  }
};

module.exports = GlobalTestConfigurationSetup;
