import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { KeysPressed } from '../systems/controller-system';
import { OnGroundState } from './on-ground-state';
import { State } from './state';

export class JumpAttackState extends State {
  frameTime = 0;
  constructor() {
    super('assets/json/jumpattack.json');
  }

  override enter(skeleton: Skeleton): void {}
  override exit(skeleton: Skeleton): void {
    throw new Error('Method not implemented.');
  }
  override handleInput(transform: Transform, input: KeysPressed): State | null {
    if (this.frameTime >= 50) {
      return new OnGroundState();
    }
    this.frameTime++;
    return this;
  }
  override update(skeleton: Skeleton): void {}
}
