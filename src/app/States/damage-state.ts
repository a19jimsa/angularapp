import { Transform } from '../components/transform';
import { Ecs } from '../ecs';
import { Entity } from '../entity';
import { KeysPressed } from '../Systems/controller-system';
import { OnGroundState } from './on-ground-state';
import { State } from './state';

export class DamageState extends State {
  frameTime = 0;
  constructor() {
    super('assets/json/hurt.json');
  }
  override enter(entity: Entity, ecs: Ecs): void {
    const transform = ecs.getComponent<Transform>(entity, 'Transform');
    if (!transform) return;
    transform.velocity.X = 0;
  }
  override exit(entity: Entity, ecs: Ecs): void {
    throw new Error('Method not implemented.');
  }
  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): State | null {
    if (this.frameTime >= 30) {
      return new OnGroundState();
    }
    return null;
  }
  override update(entity: Entity, ecs: Ecs): void {
    this.frameTime++;
  }
}
