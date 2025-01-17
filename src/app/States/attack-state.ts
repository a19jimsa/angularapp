import { Skeleton } from '../components/skeleton';
import { KeysPressed } from '../systems/controller-system';
import { OnGroundState } from './on-ground-state';
import { State } from './state';

export class AttackState extends State {
  frameTimer = 0;
  constructor() {
    super('assets/json/attack.json');
  }
  override enter(skeleton: Skeleton): void {
    skeleton.state.keyframes = this.keyframes;
    skeleton.startTime = performance.now();
    skeleton.bones.push();
  }
  override execute(): void {
    throw new Error('Method not implemented.');
  }
  override exit(skeleton: Skeleton): void {}
  override handleInput(skeleton: Skeleton, input: KeysPressed): State | null {
    if (this.frameTimer > 16) {
      return new OnGroundState();
    }
    return null;
  }
  override update(skeleton: Skeleton): void {
    this.frameTimer++;
  }
}
