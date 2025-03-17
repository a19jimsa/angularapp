import { Transform } from '../components/transform';
import { Ecs } from '../core/ecs';
import { Entity } from '../app/entity';
import { KeysPressed } from '../systems/controller-system';
import { OnGroundState } from './on-ground-state';
import { StateMachine } from './state-machine';
import { Damage } from 'src/components/damage';
import { States } from 'src/components/state';
import { ResourceManager } from 'src/core/resource-manager';
import { Skeleton } from 'src/components/skeleton';
import { Life } from 'src/components/life';
import { DeathState } from './death-state';

export class DamageState extends StateMachine {
  override enter(entity: Entity, ecs: Ecs): void {
    console.log('Damage');
    const transform = ecs.getComponent<Transform>(entity, 'Transform');
    transform.velocity.x = 0;
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (!transform || !skeleton) return;
    skeleton.keyframes = ResourceManager.getAnimation(
      skeleton.resource,
      States.Damage
    );
    skeleton.animationDuration =
      skeleton.keyframes[skeleton.keyframes.length - 1].time;
    skeleton.startTime = performance.now();
    skeleton.elapsedTime = 0;
  }

  override exit(entity: Entity, ecs: Ecs): void {
    ecs.removeComponent<Damage>(entity, 'Damage');
  }

  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): StateMachine | null {
    const life = ecs.getComponent<Life>(entity, 'Life');
    if (!life) return null;
    if (life.currentHp <= 0) {
      return new DeathState();
    }
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (!skeleton) return null;
    if (skeleton.elapsedTime > skeleton.animationDuration) {
      return new OnGroundState();
    }
    return null;
  }

  override update(entity: Entity, ecs: Ecs): void {
    const damage = ecs.getComponent<Damage>(entity, 'Damage');
    if (damage) {
      damage.timer--;
    }
  }
}
