import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../core/ecs';
import { Entity } from '../app/entity';
import { KeysPressed } from '../systems/controller-system';
import { Attack2State } from './attack2-state';
import { OnGroundState } from './on-ground-state';
import { State } from './state';

export class AttackState extends State {
  frameTimer = 0;
  override enter(entity: Entity, ecs: Ecs): void {
    console.log('Attack');
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    const transform = ecs.getComponent<Transform>(entity, 'Transform');

    if (skeleton) {
      skeleton.startTime = performance.now();
    }
    this.frameTimer = 0;
  }
  override exit(entity: Entity, ecs: Ecs): void {}
  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): State | null {
    if (this.frameTimer > 12 && input.attack) {
      return new Attack2State();
    } else if (this.frameTimer > 12) {
      return new OnGroundState();
    }
    return null;
  }
  override update(entity: Entity, ecs: Ecs): void {
    this.frameTimer++;
  }
}
