import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { KeysPressed } from '../systems/controller-system';
import { OnGroundState } from './on-ground-state';
import { State } from './state';

export class FallingState extends State {
  constructor() {
    super('assets/json/falling.json');
  }
  override enter(skeleton: Skeleton): void {}
  override exit(skeleton: Skeleton): void {
    throw new Error('Method not implemented.');
  }
  override handleInput(transform: Transform, input: KeysPressed): State | null {
    if (transform.position.Y >= 350) {
      return new OnGroundState();
    }
    return null;
  }
  override update(skeleton: Skeleton): void {}
}
