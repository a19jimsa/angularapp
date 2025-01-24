import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { KeysPressed } from '../systems/controller-system';
import { FallingState } from './falling-state';
import { OnGroundState } from './on-ground-state';
import { State } from './state';

export class JumpingState extends State {
  frameTime = 0;
  constructor() {
    super('assets/json/jumping.json');
  }
  override enter(skeleton: Skeleton): void {
    skeleton.startTime = performance.now();
  }
  override exit(skeleton: Skeleton): void {
    throw new Error('Method not implemented.');
  }
  override handleInput(transform: Transform, input: KeysPressed): State | null {
    if (transform.velocity.Y > 0) {
      return new FallingState();
    }
    return null;
  }
  override update(skeleton: Skeleton): void {
    this.frameTime++;
  }
}
