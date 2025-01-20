import { Skeleton } from '../components/skeleton';
import { KeysPressed } from '../systems/controller-system';
import { State } from './state';

export class FlyerIdleState extends State {
  constructor() {
    super('assets/json/flying.json');
  }
  override enter(skeleton: Skeleton): void {
    skeleton.state.keyframes = this.keyframes;
  }
  override execute(): void {
    throw new Error('Method not implemented.');
  }
  override exit(skeleton: Skeleton): void {
    throw new Error('Method not implemented.');
  }
  override handleInput(skeleton: Skeleton, input: KeysPressed): State | null {
    throw new Error('Method not implemented.');
  }
  override update(skeleton: Skeleton): void {
    throw new Error('Method not implemented.');
  }
}
