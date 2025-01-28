import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { KeysPressed } from '../systems/controller-system';
import { OnGroundState } from './on-ground-state';
import { State } from './state';

export class AttackState extends State {
  frameTimer = 0;
  constructor() {
    super('assets/json/attack.json');
  }
  override enter(skeleton: Skeleton): void {
    skeleton.startTime = performance.now();
  }
  override exit(skeleton: Skeleton): void {}
  override handleInput(transform: Transform, input: KeysPressed): State | null {
    if (this.frameTimer > 15) {
      return new OnGroundState();
    }
    return null;
  }
  override update(skeleton: Skeleton): void {
    this.frameTimer++;
  }
}
