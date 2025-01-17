import { Keyframe } from '../animation-creator/animation-creator.component';
import { Skeleton } from '../components/skeleton';
import { KeysPressed } from '../systems/controller-system';
import { AttackState } from './attack-state';
import { RunningState } from './running-state';
import { State } from './state';

export class OnGroundState extends State {
  constructor() {
    super('assets/json/idle.json');
  }
  override enter(): void {}
  override execute(): void {
    throw new Error('Method not implemented.');
  }
  override exit(): void {
    throw new Error('Method not implemented.');
  }
  override handleInput(input: KeysPressed, skeleton: Skeleton): State {
    if (input.right || input.left) {
      return new RunningState();
    } else if (input.attack) {
      skeleton.startTime = performance.now();
      return new AttackState();
    }
    return this;
  }
  override update(): void {}
}
