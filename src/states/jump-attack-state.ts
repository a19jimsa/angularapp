import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../core/ecs';
import { Entity } from '../app/entity';
import { KeysPressed } from '../systems/controller-system';
import { OnGroundState } from './on-ground-state';
import { State } from './state';
import { ResourceManager } from 'src/core/resource-manager';

export class JumpAttackState extends State {
  frameTime = 0;

  override enter(entity: Entity, ecs: Ecs): void {
    console.log('Jump attack');
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (skeleton)
      skeleton.state.keyframes = ResourceManager.getAnimation('jumpattack');
  }
  override exit(entity: Entity, ecs: Ecs): void {}
  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): State | null {
    if (this.frameTime >= 80) {
      return new OnGroundState();
    }
    return null;
  }
  override update(entity: Entity, ecs: Ecs): void {
    const transform = ecs.getComponent<Transform>(entity, 'Transform');
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (transform) {
      transform.velocity.X *= 0.95;
    }
    if (skeleton) {
      skeleton.rotation = 0;
    }

    this.frameTime++;
  }
}
