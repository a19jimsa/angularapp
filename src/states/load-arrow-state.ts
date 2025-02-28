import { Skeleton } from '../components/skeleton';
import { Ecs } from '../core/ecs';
import { Entity } from '../app/entity';
import { KeysPressed } from '../systems/controller-system';
import { OnGroundState } from './on-ground-state';
import { StateMachine } from './state-machine';
import { Bow } from 'src/components/bow';
import { Life } from 'src/components/life';
import { DeathState } from './death-state';
import { DamageState } from './damage-state';
import { Damage } from 'src/components/damage';

export class LoadArrowState extends StateMachine {
  frameTime = 0;
  override enter(entity: Entity, ecs: Ecs): void {
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (!skeleton) return;
    skeleton.startTime = performance.now();
    ecs.addComponent<Bow>(entity, new Bow());
  }
  override exit(entity: Entity, ecs: Ecs): void {
    ecs.removeComponent<Bow>(entity, 'Bow');
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
    if (input.up) {
      return null;
    }
    return new OnGroundState();
  }
  override update(entity: Entity, ecs: Ecs): void {
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (this.frameTime >= 120) {
    }
    this.frameTime++;
  }
}
