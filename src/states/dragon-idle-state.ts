import { Ecs } from '../core/ecs';
import { Entity } from '../app/entity';
import { KeysPressed } from '../systems/controller-system';
import { State } from './state';
import { ResourceManager } from 'src/core/resource-manager';

export class DragonIdleState extends State {
  override enter(entity: Entity, ecs: Ecs): void {
    this.keyframes = ResourceManager.getAnimation('dragonidle');
  }
  override exit(entity: Entity, ecs: Ecs): void {}
  override handleInput(entity: Entity, ecs: Ecs, input: KeysPressed): State {
    throw new Error('Method not implemented.');
  }
  override update(entity: Entity, ecs: Ecs): void {}
}
