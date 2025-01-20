import { Skeleton } from '../components/skeleton';
import { Loader } from '../loader';
import { KeysPressed } from '../systems/controller-system';
import { OnGroundState } from './on-ground-state';
import { State } from './state';

export class AttackState extends State {
  frameTimer = 0;
  constructor() {
    super('assets/json/attack.json');
  }
  override async enter(skeleton: Skeleton): Promise<void> {
    skeleton.state.keyframes = this.keyframes;
    skeleton.startTime = performance.now();
    const bones = await Loader.loadFromJSON('assets/json/1hweapon.json');
    if (bones) {
      console.log(bones);
      skeleton.bones.push(bones[0]);
    }
  }
  override execute(): void {
    throw new Error('Method not implemented.');
  }
  override exit(skeleton: Skeleton): void {
    const weaponId = skeleton.bones.findIndex((e) => e.id === 'sword');
    if (weaponId !== -1) {
      skeleton.bones.splice(weaponId, 1);
    }
  }
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
