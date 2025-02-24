import { Enemy } from '../components/enemy';
import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../core/ecs';
import { Entity } from '../app/entity';
import { KeysPressed } from '../systems/controller-system';
import { FallingState } from './falling-state';
import { StateMachine } from './state-machine';
import { Jump } from 'src/components/jump';
import { JumpAttackState } from './jump-attack-state';

export class JumpingState extends StateMachine {
  frameTime = 0;
  override enter(entity: Entity, ecs: Ecs): void {
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    const transform = ecs.getComponent<Transform>(entity, 'Transform');
    if (skeleton) {
      skeleton.startTime = performance.now();
    }
    if (transform) {
      transform.velocity.Y = -20;
    }
    ecs.addComponent<Jump>(entity, new Jump());
    console.log('Jumping');
  }
  override exit(entity: Entity, ecs: Ecs): void {
    ecs.removeComponent<Jump>(entity, 'Jump');
  }
  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): StateMachine | null {
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
  override update(entity: Entity, ecs: Ecs): void {}
}
