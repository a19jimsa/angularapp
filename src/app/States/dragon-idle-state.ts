import { Skeleton } from '../components/skeleton';
import { KeysPressed } from '../systems/controller-system';
import { State } from './state';

export class DragonIdleState extends State {
  constructor() {
    super('assets/json/dragonidle.json');
  }
  override enter(): void {
    throw new Error('Method not implemented.');
  }
  override execute(): void {
    throw new Error('Method not implemented.');
  }
  override exit(): void {
    throw new Error('Method not implemented.');
  }
  override handleInput(input: KeysPressed): State {
    throw new Error('Method not implemented.');
  }
  override update(skeleton: Skeleton): void {
    throw new Error('Method not implemented.');
  }
}
