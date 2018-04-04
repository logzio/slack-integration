class Command {

  configure(controller) {
    throw new Error('Method `configure` must be overridden!');
  }


  getCategory() {
    throw new Error('Method `getCategory` must be overridden!');
  }

  getUsage() {
    throw new Error('Method `getUsage` must be overridden!');
  }

}

module.exports = Command;
