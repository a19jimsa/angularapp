import { Ecs } from '../core/ecs';
import { Entity } from '../app/entity';
import { KeysPressed } from '../systems/controller-system';
import { State } from './state';

export class DragonBossState extends State {
  override enter(entity: Entity, ecs: Ecs): void {}
  override exit(entity: Entity, ecs: Ecs): void {}
  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): State | null {
    return this;
  }
  override update(entity: Entity, ecs: Ecs): void {}
}
