import { Skeleton } from '../components/skeleton';
import { KeysPressed } from '../systems/controller-system';
import { State } from './state';

export class FlyerIdleState extends State {
  constructor() {
    super('assets/json/flying.json');
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
  override handleInput(input: KeysPressed, skeleton: Skeleton): State {
    throw new Error('Method not implemented.');
  }
  override update(): void {
    throw new Error('Method not implemented.');
  }
}
