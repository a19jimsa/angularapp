import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { KeysPressed } from '../systems/controller-system';
import { State } from './state';

export class DragonBossState extends State {
  constructor() {
    super('assets/json/dragonanimation.json');
  }
  override enter(skeleton: Skeleton): void {
    throw new Error('Method not implemented.');
  }
  override exit(skeleton: Skeleton): void {
    throw new Error('Method not implemented.');
  }
  override handleInput(transform: Transform, input: KeysPressed): State | null {
    return this;
  }
  override update(skeleton: Skeleton): void {}
}
