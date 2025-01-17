import { Keyframe } from '../animation-creator/animation-creator.component';
import { Skeleton } from '../components/skeleton';
import { KeysPressed } from '../systems/controller-system';
import { OnGroundState } from './on-ground-state';
import { State } from './state';

export class RunningState extends State {
  constructor() {
    super('assets/json/running.json');
  }

  override enter(): void {
    throw new Error('Method not implemented.');
  }
  override execute(): void {
    throw new Error('Method not implemented.');
  }
  override exit(): void {
    throw new Error('Method not implemented.');
  }
  override handleInput(input: KeysPressed): State {
    if (input.right || input.left) {
      return this;
    }
    return new OnGroundState();
  }
  override update(skeleton: Skeleton): void {}
}
