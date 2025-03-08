import { Skeleton } from '../components/skeleton';
import { Ecs } from '../core/ecs';
import { Entity } from '../app/entity';
import { KeysPressed } from '../systems/controller-system';
import { StateMachine } from './state-machine';
import { ResourceManager } from 'src/core/resource-manager';
import { States } from 'src/components/state';
import { AttackDuration } from 'src/components/attack-duration';
import { OnGroundState } from './on-ground-state';
import { Damage } from 'src/components/damage';
import { DamageState } from './damage-state';
import { MathUtils } from 'src/Utils/MathUtils';
import { Combo } from 'src/components/combo';

export class AttackState extends StateMachine {
  override enter(entity: Entity, ecs: Ecs): void {
    console.log('Attack state');
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (skeleton) {
      skeleton.keyframes = ResourceManager.getAnimation(
        skeleton,
        States.Attacking
      );
    }
  }

  override exit(entity: Entity, ecs: Ecs): void {}

  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): StateMachine | null {
    //Check if damaged
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

  override update(entity: Entity, ecs: Ecs): void {}

  executeAttack(entity: Entity, ecs: Ecs): void {
    const combo = ecs.getComponent<Combo>(entity, 'Combo');
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    const attackDuration = ecs.getComponent<AttackDuration>(
      entity,
      'AttackDuration'
    );
    if (combo && skeleton && attackDuration) {
      switch (combo.comboCounter) {
        case 1:
          skeleton.keyframes = ResourceManager.getAnimation(
            skeleton,
            States.SmashAttack
          );
          combo.comboCounter++;
          combo.comboTimer = 3;
          MathUtils.createSnaphot(skeleton);
          attackDuration.cooldown = 0.5;
          console.log('Smash attack!');
          break;
        case 2:
          combo.comboTimer = 0;
          break;
        default:
          break;
      }
    }
  }
}
