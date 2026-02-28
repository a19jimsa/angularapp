import { Command } from 'src/commands/command';
import { CompositeCommand } from './composite-command';

export class CommandManager {
  private static commands: Command[] = [];
  private static index = -1;
  private static currentBatch: CompositeCommand | null = null;

  static beginBatch() {
    this.currentBatch = new CompositeCommand();
  }

  static endBatch() {
    if (!this.currentBatch || this.currentBatch.isEmpty()) {
      this.currentBatch = null;
      return;
    }

    // klipp bort redo-historik
    this.commands.length = this.index + 1;

    this.commands.push(this.currentBatch);
    this.index++;

    this.currentBatch = null;
  }

  static add(cmd: Command) {
    // kör direkt
    cmd.execute();
    // om batch pågår → lägg där
    if (this.currentBatch) {
      this.currentBatch.add(cmd);
      return;
    }

    // annars normal undo-punkt
    this.commands.length = this.index + 1;
    this.commands.push(cmd);
    this.index++;
  }

  static undo() {
    if (this.index < 0) return;
    this.commands[this.index].undo();
    this.index--;
  }
}
