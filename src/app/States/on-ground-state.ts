import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { KeysPressed } from '../systems/controller-system';
import { AttackState } from './attack-state';
import { JumpingState } from './jumping-state';
import { LoadArrowState } from './load-arrow-state';
import { RunningState } from './running-state';
import { State } from './state';

export class OnGroundState extends State {
  constructor() {
    super('assets/json/idle.json');
  }
  override enter(skeleton: Skeleton): void {}
  override exit(skeleton: Skeleton): void {
    throw new Error('Method not implemented.');
  }
  override handleInput(transform: Transform, input: KeysPressed): State | null {
    if (input.right || input.left) {
      return new RunningState();
    } else if (input.attack) {
      return new AttackState();
    } else if (input.jump) {
      return new JumpingState();
    } else if (input.up) {
      return new LoadArrowState();
    }
    return null;
  }
  override update(skeleton: Skeleton): void {}
}
