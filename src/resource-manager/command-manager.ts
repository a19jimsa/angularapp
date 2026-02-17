import { Command } from 'src/commands/command';

export class CommandManager {
  private static commands: Command[] = [];
  private static index = -1;

  static execute(cmd: Command) {
    this.commands.length = this.index + 1;
    cmd.execute();
    this.commands.push(cmd);
    this.index++;
  }

  static undo() {
    if (this.index < 0) return;
    this.commands[this.index].undo();
    this.index--;
  }
}
