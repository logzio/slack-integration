const Command = require('../core/commands/command');

const commandRegex = /get kibana (objects|vis|visualizations?|dash|dashboards?|search|searches)/;

class KibanaObjectsCommand extends Command {

  constructor(kibanaClient) {
    super();
    this.kibanaClient = kibanaClient;
  }
  configure(controller) {
    const kibanaClient = this.kibanaClient;
    controller.hears([commandRegex], 'direct_message,direct_mention', function (bot, message) {
      const objectType = message.text.match(commandRegex)[1].toLocaleLowerCase();

      let objectTypes = ['dashboard', 'visualization', 'search'];
      switch (objectType) {
        case 'vis':
        case 'visualization':
        case 'visualizations':
          objectTypes = ['visualization'];
          break;
        case 'dash':
        case 'dashboard':
        case 'dashboards':
          objectTypes = ['dashboard'];
          break;
        case 'search':
        case 'searches':
          objectTypes = ['search'];
          break;
      }

      const promises = objectTypes.map(objectType => kibanaClient.listObjects(message.team, objectType));
      Promise.all(promises)
        .then(results => {
          const kibanaObjects = [];
          results.forEach(objects => {
            objects
              .map(kibanaObject => `${kibanaObject['_type']} - ${kibanaObject['_source']['title']}`)
              .forEach(objectLine => kibanaObjects.push(objectLine))
          });

          bot.reply(message, kibanaObjects.join('\n'));
        });
    })
  }

  getCategory() {
    return 'kibana';
  }

  getUsage() {
    return [
      '*get kibana &lt;objects|dashboards|visualizations|searches&gt;* - Lists all available kibana objects'
    ];
  }

}

module.exports = KibanaObjectsCommand;
