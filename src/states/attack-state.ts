import { Skeleton } from '../components/skeleton';
import { Ecs } from '../core/ecs';
import { Entity } from '../app/entity';
import { KeysPressed } from '../systems/controller-system';
import { StateMachine } from './state-machine';
import { ResourceManager } from 'src/core/resource-manager';
import { States } from 'src/components/state';
import { Attack } from 'src/components/attack';
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
      MathUtils.createSnaphot(skeleton);
      ecs.addComponent<AttackDuration>(entity, new AttackDuration(0.5));
      ecs.addComponent<Attack>(entity, new Attack());
      ecs.addComponent<Combo>(entity, new Combo(1));
    }
  }

  override exit(entity: Entity, ecs: Ecs): void {
    ecs.removeComponent<AttackDuration>(entity, 'AttackDuration');
    ecs.removeComponent<Attack>(entity, 'Attack');
    ecs.removeComponent<Combo>(entity, 'Combo');
  }

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
    const combo = ecs.getComponent<Combo>(entity, 'Combo');
    const attackDuration = ecs.getComponent<AttackDuration>(
      entity,
      'AttackDuration'
    );

    if (attackDuration) {
      if (attackDuration.cooldown <= 0) {
        if (input.attack) {
          this.executeAttack(entity, ecs);
          return null;
        }
      } else {
        return null;
      }
    }
    return new OnGroundState();
  }

  override update(entity: Entity, ecs: Ecs): void {
    const attackDuration = ecs.getComponent<AttackDuration>(
      entity,
      'AttackDuration'
    );
    if (attackDuration) attackDuration.cooldown -= 0.016;
    const combo = ecs.getComponent<Combo>(entity, 'Combo');
    if (combo) {
      combo.comboTimer -= 0.016;
    }
  }

  executeAttack(entity: Entity, ecs: Ecs): void {
    const combo = ecs.getComponent<Combo>(entity, 'Combo');
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    const attackDuration = ecs.getComponent<AttackDuration>(
      entity,
      'AttackDuration'
    );
    if (combo && skeleton && attackDuration) {
      console.log(combo.comboCounter);
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
          ecs.removeComponent<AttackDuration>(entity, 'AttackDuration');
          break;
        default:
          break;
      }
    }
  }
}
