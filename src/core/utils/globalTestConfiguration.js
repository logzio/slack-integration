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
const AddAccountCommand = require('../../accounts/add/add-account-command');

class GlobalTestConfiguration {

  constructor() {
  }

  async beforeAll(jasmineSpyHandlers,jasmineSpyHandlerReturnValues) {
    await this.setupGeneralTestConfigurations(jasmineSpyHandlers, jasmineSpyHandlerReturnValues);
  }

  async setupGeneralTestConfigurations(jasmineSpyHandlers, jasmineSpyHandlerReturnValues) {
    this.storage = await createTestStorage();
    this.teamConfigurationService = new TeamConfigurationService(this.storage);
    await this.saveDefaultTeams();
    this.port = await findFreePort(3000);
    this.externalDomain = `http://localhost:${this.port}`;
    apiConfig['regions']['us-east-1'].endpoint = this.externalDomain;
    apiConfig['regions']['eu-central-1'].endpoint = this.externalDomain;
    this.endpointResolver = new EndpointResolver(apiConfig);
    this.httpSpy = JasmineHttpServerSpy.createSpyObj('mockServer', jasmineSpyHandlers);
    this.handlers = [];
    for (let i = 0; i < jasmineSpyHandlers.length; i++) {
      let handler = jasmineSpyHandlers[i].handlerName;
      this.handlers.push(handler);
      this.httpSpy[handler].and.returnValue(jasmineSpyHandlerReturnValues[i]);
    }
    await this.httpSpy.server.start(this.port[0]);
  }

  async saveDefaultTeams() {
    const botTeams = [{
      "id": 'teamId66',
      "createdBy": 'userId',
      "url": "https://logzio.slack.com/",
      "name": "Test Logz IO Account",
      "state": "botkit",
      "bot": {
        "token": "bot-token",
        "user_id": 'userId',
        "createdBy": 'userId',
        "app_token": "app-token"
      },
      "token": "api-token"
    }];

    for (let i = 0; i < botTeams.length; i++) {
      await this.storage.teams.save(botTeams[i]);
      const teamConfiguration = new TeamConfiguration()
        .setLogzioAccountRegion('us-east-1')
        .setLogzioApiToken('api-token')
        .setAlias('alis_' + botTeams[i].id)
        .setRealName('realName');
      await this.teamConfigurationService.saveDefault(botTeams[i].id, teamConfiguration);
    }
  }

  afterAll(done){
    this.httpSpy.server.stop(done)
  }
  afterEach(){
    for(let i = 0; i < this.handlers.length; i++) {
      this.httpSpy[this.handlers[i]].calls.reset();
    }
  }

  async initBeforeEach(kibanaClient, commandType) {
    this.controller = Botmock({});
    this.bot = this.controller.spawn({type: 'slack'});

    if(commandType === CommandName.SETUP) {

      this.bot.api.setData('im.open', {
        'userId': {
          ok: true,
          channel: {
            id: 'someChannelId'
          }
        },
      });


      this.bot.api.setFilter('im.open', function (params) {
        return this.data[params.user];
      });

      const setupDialogSender = new SetupDialogSender(this.teamConfigurationService, apiConfig);
      this.command = new AddAccountCommand(setupDialogSender);
      this.command.configure(this.controller);
    }else if (commandType === CommandName.SNAPSHOT) {
      const snapshotsClient = this.createSnapshotClient();
      this.command = new SnapshotCommand(this.externalDomain, kibanaClient, snapshotsClient);
      this.command.configure(this.controller);

    }else{
      this.httpClient = new HttpClient(this.teamConfigurationService, this.endpointResolver);
    }

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

  async mockFirstInstall(id,region,token,apiToken){

    const botTeam = {
      "id": `${id}`,
      "createdBy": 'userId',
      "url": "https://logzio.slack.com/",
      "name": "Test Logz IO Account"+`${id}`,
      "state": "botkit",
      "bot": {
        "token": "token",
        "user_id": 'userId',
        "createdBy": 'userId'
      },
      "token": `${token}`
    };

    if(apiToken){
      botTeam.bot.app_token = `${apiToken}`;
    }
    await this.storage.teams.save(botTeam);
    const teamConfiguration = new TeamConfiguration()
        .setLogzioAccountRegion(region)
        .setRealName('realName')
        .setAlias('alis_'+botTeam.id);

    if(apiToken){
      teamConfiguration.setLogzioApiToken(`${apiToken}`)
    }

    await this.teamConfigurationService.saveDefault(botTeam.id, teamConfiguration);
  }

}

async function createTestStorage() {
  const dbConfig = {
    user: DBUtils.getRequiredValueFromEnv('MYSQL_USER'),
    password: DBUtils.getRequiredValueFromEnv('MYSQL_PASSWORD'),
    host: DBUtils.getRequiredValueFromEnv('MYSQL_HOST'),
  };

  logger.info("createTestStorage:step1");
  await executeSqlStatement(dbConfig,"DROP DATABASE IF EXISTS logzbot_tests");
  await executeSqlStatement(dbConfig,"CREATE DATABASE logzbot_tests");
  logger.info("createTestStorage:finished");

  dbConfig.database = 'logzbot_tests';
  await DBUtils.migrateDatabase(dbConfig);
  const storage =  new LogzStorageMySQL(dbConfig);

  return storage;

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

module.exports = GlobalTestConfiguration;
