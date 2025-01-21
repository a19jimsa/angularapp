import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { KeysPressed } from '../systems/controller-system';
import { State } from './state';

export class DragonIdleState extends State {
  constructor() {
    super('assets/json/dragonidle.json');
  }
  override enter(skeleton: Skeleton): void {
    throw new Error('Method not implemented.');
  }
  override exit(skeleton: Skeleton): void {
    throw new Error('Method not implemented.');
  }
  override handleInput(transform: Transform, input: KeysPressed): State {
    throw new Error('Method not implemented.');
  }
  override update(skeleton: Skeleton): void {
    throw new Error('Method not implemented.');
  }
}
