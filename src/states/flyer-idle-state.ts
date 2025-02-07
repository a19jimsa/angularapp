import { Ecs } from '../core/ecs';
import { Entity } from '../app/entity';
import { KeysPressed } from '../systems/controller-system';
import { State } from './state';
import { Skeleton } from 'src/components/skeleton';
import { ResourceManager } from 'src/core/resource-manager';

export class FlyerIdleState extends State {
  override enter(entity: Entity, ecs: Ecs): void {
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (skeleton)
      skeleton.state.keyframes = ResourceManager.getAnimation('flying');
  }
  override exit(entity: Entity, ecs: Ecs): void {}
  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): State | null {
    throw new Error('Method not implemented.');
  }
  override update(entity: Entity, ecs: Ecs): void {}
}
