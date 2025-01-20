import { Skeleton } from '../components/skeleton';
import { KeysPressed } from '../systems/controller-system';
import { OnGroundState } from './on-ground-state';
import { State } from './state';

export class LoadArrowState extends State {
  frameTime = 0;
  constructor() {
    super('assets/json/loadarrow.json');
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
    if (input.up) {
      return null;
    }
    return new OnGroundState();
  }
  override update(skeleton: Skeleton): void {
    const time = skeleton.state.keyframes.at(-1)?.time;
    const elapsedTime = (performance.now() - skeleton.startTime) / 1000;
    if (time) {
      if (elapsedTime > time) {
        skeleton.startTime = performance.now() - 2 * 1000;
        console.log(skeleton.startTime);
      }
    }
  }
}
