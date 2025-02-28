import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../core/ecs';
import { Entity } from '../app/entity';
import { KeysPressed } from '../systems/controller-system';
import { OnGroundState } from './on-ground-state';
import { StateMachine } from './state-machine';
import { Life } from 'src/components/life';
import { DeathState } from './death-state';
import { Damage } from 'src/components/damage';
import { DamageState } from './damage-state';

export class FallingState extends StateMachine {
  override enter(entity: Entity, ecs: Ecs): void {
    console.log('Falling');
  }
  override exit(entity: Entity, ecs: Ecs): void {}
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
    if (!transform) return null;
    if (transform.velocity.Y === 0) {
      return new OnGroundState();
    }
    return null;
  }
  override update(entity: Entity, ecs: Ecs): void {
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (!skeleton) return;
    if (skeleton.rotation <= 360) skeleton.rotation += 10;
  }
}
