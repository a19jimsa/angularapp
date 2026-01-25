import { Bone } from '../components/bone';

export abstract class Command {
  abstract execute(): void;
  abstract undo(): void;
}
