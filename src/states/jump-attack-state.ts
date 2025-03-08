import { Skeleton } from '../components/skeleton';
import { Ecs } from '../core/ecs';
import { Entity } from '../app/entity';
import { KeysPressed } from '../systems/controller-system';
import { StateMachine } from './state-machine';
import { ResourceManager } from 'src/core/resource-manager';
import { States } from 'src/components/state';
import { AttackDuration } from 'src/components/attack-duration';
import { DamageState } from './damage-state';
import { Damage } from 'src/components/damage';
import { MathUtils } from 'src/Utils/MathUtils';
import { OnGroundState } from './on-ground-state';

export class JumpAttackState extends StateMachine {
  override enter(entity: Entity, ecs: Ecs): void {
    console.log('Jump Attack');
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (skeleton) {
      skeleton.keyframes = ResourceManager.getAnimation(
        skeleton,
        States.JumpAttack
      );
      MathUtils.createSnaphot(skeleton);
    }
  }
  override exit(entity: Entity, ecs: Ecs): void {
    ecs.removeComponent<AttackDuration>(entity, 'AttackDuration');
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
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (skeleton) {
      if (skeleton.elapsedTime >= skeleton.animationDuration) {
        return new OnGroundState();
      }
    }
    return null;
  }

  override update(entity: Entity, ecs: Ecs): void {
    const attackDuration = ecs.getComponent<AttackDuration>(
      entity,
      'AttackDuration'
    );
    if (!attackDuration) return;
    attackDuration.cooldown -= 0.016;
  }
}
