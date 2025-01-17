import { Skeleton } from '../components/skeleton';
import { KeysPressed } from '../systems/controller-system';
import { OnGroundState } from './on-ground-state';
import { State } from './state';

export class AttackState extends State {
  frameTimer = 0;
  constructor() {
    super('assets/json/attack.json');
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
    if (this.frameTimer > 20) {
      return new OnGroundState();
    }
    return this;
  }
  override update(): void {
    this.frameTimer++;
  }
}
