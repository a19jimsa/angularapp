import { Skeleton } from '../components/skeleton';
import { Ecs } from '../core/ecs';
import { Entity } from '../app/entity';
import { KeysPressed } from '../systems/controller-system';
import { StateMachine } from './state-machine';
import { ResourceManager } from 'src/core/resource-manager';
import { States } from 'src/components/state';
import { OnGroundState } from './on-ground-state';
import { Damage } from 'src/components/damage';
import { DamageState } from './damage-state';
import { MathUtils } from 'src/Utils/MathUtils';
import { Combo } from 'src/components/combo';
import { Effect } from 'src/components/effect';
import { Transform } from 'src/components/transform';
import { Vec } from 'src/app/vec';
import { Weapon } from 'src/components/weapon';

export class AttackState extends StateMachine {
  comboTimer: number = 0;
  comboStep: number = 1;
  attackTimer: number = 0;

  override enter(entity: Entity, ecs: Ecs): void {
    console.log('Attack state');
    this.spellAttack(entity, ecs);
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

  spellAttack(entity: Entity, ecs: Ecs) {
    const transform = ecs.getComponent<Transform>(entity, 'Transform');
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (!skeleton) return;
    ecs.addComponent<Effect>(
      entity,
      new Effect(
        'assets/sprites/Blt_Mag01.png',
        new Vec(transform.position.x, transform.position.y),
        'load-spell'
      )
    );
    const effect = ecs.getComponent<Effect>(entity, 'Effect');
    if (!effect) return;
    skeleton.animationDuration = effect.duration;
    this.restartAnimation(skeleton);
  }

  restartAnimation(skeleton: Skeleton) {
    if (!skeleton) return;
    console.log(skeleton);
    skeleton.animationDuration =
      skeleton.keyframes[skeleton.keyframes.length - 1].time;
    skeleton.startTime = performance.now();
    skeleton.elapsedTime = 0;
  }

  addEffectToWeapon(entity: Entity, ecs: Ecs) {
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (skeleton.heldEntity) {
      const weapon = ecs.getComponent<Weapon>(skeleton.heldEntity, 'Weapon');
      const transform = ecs.getComponent<Transform>(
        skeleton.heldEntity,
        'Transform'
      );
    }
  }

  executeAttack(entity: Entity, ecs: Ecs): void {
    const combo = ecs.getComponent<Combo>(entity, 'Combo');
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');

    if (combo && skeleton) {
      switch (combo.comboCounter) {
        case 1:
          skeleton.keyframes = ResourceManager.getAnimation(
            skeleton.resource,
            States.SmashAttack
          );
          combo.comboCounter++;
          combo.comboTimer = 3;
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
