import { Command } from 'src/commands/command';

export class CommandManager {
  private static commands: Command[] = [];
  private static index = -1;

  static execute(cmd: Command) {
    cmd.execute();
    this.commands.push(cmd);
    this.index++;
  }

  static undo() {
    const command = this.commands[this.index];
    if (this.index < 0) return;
    command.undo();
    this.commands.splice(this.index, 1);
    this.index--;
  }
}
