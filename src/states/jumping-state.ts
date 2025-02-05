import { Enemy } from '../components/enemy';
import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../core/ecs';
import { Entity } from '../app/entity';
import { KeysPressed } from '../systems/controller-system';
import { FallingState } from './falling-state';
import { JumpAttackState } from './jump-attack-state';
import { State } from './state';
import { ResourceManager } from 'src/core/resource-manager';

export class JumpingState extends State {
  frameTime = 0;
  override enter(entity: Entity, ecs: Ecs): void {
    console.log('Jumping');
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    const transform = ecs.getComponent<Transform>(entity, 'Transform');
    if (skeleton) {
      skeleton.startTime = performance.now();
    }
    if (transform) {
      transform.velocity.Y = -20;
    }
  }
  override exit(entity: Entity, ecs: Ecs): void {}
  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): State | null {
    const transform = ecs.getComponent<Transform>(entity, 'Transform');
    if (transform) {
      if (transform.velocity.Y >= 0) {
        return new FallingState();
      }
    }
    if (input.attack) {
      return new JumpAttackState();
    }
    return null;
  }
  override update(entity: Entity, ecs: Ecs): void {
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (skeleton.rotation <= 360) skeleton.rotation += 10;
    this.frameTime++;
  }
}
