import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../core/ecs';
import { Entity } from '../app/entity';
import { KeysPressed } from '../systems/controller-system';
import { FallingState } from './falling-state';
import { StateMachine } from './state-machine';
import { Jump } from 'src/components/jump';
import { JumpAttackState } from './jump-attack-state';
import { Damage } from 'src/components/damage';
import { DamageState } from './damage-state';
import { MathUtils } from 'src/Utils/MathUtils';
import { ResourceManager } from 'src/core/resource-manager';
import { States } from 'src/components/state';

export class JumpingState extends StateMachine {
  frameTime = 0;
  override enter(entity: Entity, ecs: Ecs): void {
    console.log('Jumping');
    const transform = ecs.getComponent<Transform>(entity, 'Transform');
    if (transform) {
      transform.velocity.y = -20;
    }
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (skeleton) {
      skeleton.keyframes = ResourceManager.getAnimation(
        skeleton.resource,
        States.Jump
      );
      skeleton.startTime = performance.now();
    }
  }

  override exit(entity: Entity, ecs: Ecs): void {
    ecs.removeComponent<Jump>(entity, 'Jump');
  }

  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): StateMachine | null {
    const damage = ecs.getComponent<Damage>(entity, 'Damage');
    if (damage) {
      return new DamageState();
    }
    const transform = ecs.getComponent<Transform>(entity, 'Transform');
    if (transform) {
      if (transform.velocity.y >= 0) {
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
