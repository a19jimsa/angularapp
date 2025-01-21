import { Skeleton } from '../components/skeleton';
import { KeysPressed } from '../systems/controller-system';
import { OnGroundState } from './on-ground-state';
import { State } from './state';

export class AttackState extends State {
  frameTimer = 0;
  constructor() {
    super('assets/json/attack.json');
  }
  override async enter(skeleton: Skeleton): Promise<void> {
    
    skeleton.startTime = performance.now();
  }
  override execute(): void {
    throw new Error('Method not implemented.');
  }
  override exit(skeleton: Skeleton): void {}
  override handleInput(skeleton: Skeleton, input: KeysPressed): State | null {
    if (this.frameTimer > 16) {
      this.exit(skeleton);
      return new OnGroundState();
    }
    return null;
  }
  override update(skeleton: Skeleton): void {
    this.frameTimer++;
  }
}
