import { Skeleton } from '../components/skeleton';
import { KeysPressed } from '../systems/controller-system';
import { JumpingState } from './jumping-state';
import { OnGroundState } from './on-ground-state';
import { State } from './state';

export class RunningState extends State {
  constructor() {
    super('assets/json/running.json');
  }

  override enter(skeleton: Skeleton): void {}
  override execute(): void {
    throw new Error('Method not implemented.');
  }
  override exit(skeleton: Skeleton): void {
    throw new Error('Method not implemented.');
  }
  override handleInput(skeleton: Skeleton, input: KeysPressed): State | null {
    if (input.jump) {
      return new JumpingState();
    }
    if (input.right || input.left) {
      return null;
    }
    return new OnGroundState();
  }
  override update(skeleton: Skeleton): void {}
}
