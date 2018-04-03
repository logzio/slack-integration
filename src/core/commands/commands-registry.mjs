import Command from "./command";

const commands = [];

export default class CommandsRegistry {

  static register(command) {
    if (!(command instanceof Command)) {
      throw new Error('Parameter `command` must be instance of Command class');
    }

    commands.push(command);
  }

  static getCommands() {
    return commands;
  }

}
