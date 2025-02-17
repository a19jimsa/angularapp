import { Entity } from 'src/app/entity';
import { Ecs } from 'src/core/ecs';
import { KeysPressed } from 'src/systems/controller-system';
import { State } from './state';

export class BirdBossState extends State {
  override enter(entity: Entity, ecs: Ecs): void {}
  override exit(entity: Entity, ecs: Ecs): void {
    throw new Error('Method not implemented.');
  }
  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): State | null {
    return null;
  }
  override update(entity: Entity, ecs: Ecs): void {}
}
