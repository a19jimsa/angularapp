import { Bone } from '../components/bone';

export abstract class Command {
  command: Command[] = new Array();
  abstract execute(): void;
  abstract undo(): void;
}
