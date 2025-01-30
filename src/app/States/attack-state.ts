import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../ecs';
import { Entity } from '../entity';
import { KeysPressed } from '../systems/controller-system';
import { OnGroundState } from './on-ground-state';
import { State } from './state';

export class AttackState extends State {
  frameTimer = 0;
  constructor() {
    super('assets/json/attack.json');
  }
  override enter(entity: Entity, ecs: Ecs): void {
    console.log('Attack');
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    const transform = ecs.getComponent<Transform>(entity, 'Transform');
    if (skeleton) {
      skeleton.startTime = performance.now();
    }
    if (transform) {
      transform.velocity.X = 0;
    }
  }
  override exit(entity: Entity, ecs: Ecs): void {}
  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): State | null {
    if (this.frameTimer > 120) {
      return new OnGroundState();
    }
    return null;
  }
  override update(entity: Entity, ecs: Ecs): void {
    this.frameTimer++;
  }
}
