import { Skeleton } from '../components/skeleton';
import { KeysPressed } from '../systems/controller-system';
import { OnGroundState } from './on-ground-state';
import { State } from './state';

export class JumpingState extends State {
  frameTime = 0;
  constructor() {
    super('assets/json/jumping.json');
  }

  override enter(skeleton: Skeleton): void {
    skeleton.state.keyframes = this.keyframes;
    skeleton.startTime = performance.now();
  }
  override execute(): void {
    throw new Error('Method not implemented.');
  }
  override exit(skeleton: Skeleton): void {
    throw new Error('Method not implemented.');
  }
  override handleInput(skeleton: Skeleton, input: KeysPressed): State | null {
    if (this.frameTime > 30) {
      return new OnGroundState();
    }
    return null;
  }
  override update(skeleton: Skeleton): void {
    this.frameTime++;
  }
}
