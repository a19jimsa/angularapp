import { Bone } from '../components/bone';
import { Command } from './command';

export class ChangeBoneCommand extends Command {
  bone: Bone;
  constructor(bone: Bone) {
    super();
    this.bone = bone;
  }

  override execute(): void {}

  override undo(): void {}
}
