import { Command } from 'src/commands/command';

export class CompositeCommand implements Command {
  private commands: Command[] = [];

  add(cmd: Command) {
    this.commands.push(cmd);
  }

  execute() {
    for (const cmd of this.commands) {
      cmd.execute();
    }
  }

  undo() {
    // viktigt: baklänges!
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
  }

  isEmpty() {
    return this.commands.length === 0;
  }
}
