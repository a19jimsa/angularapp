import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../core/ecs';
import { Entity } from '../app/entity';
import { KeysPressed } from '../systems/controller-system';
import { OnGroundState } from './on-ground-state';
import { State } from './state';
import { ResourceManager } from 'src/core/resource-manager';

export class LoadArrowState extends State {
  frameTime = 0;
  override enter(entity: Entity, ecs: Ecs): void {
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (!skeleton) return;
    skeleton.startTime = performance.now();
    skeleton.state.keyframes = ResourceManager.getAnimation('loadarrow');
  }
  override exit(entity: Entity, ecs: Ecs): void {}
  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): State | null {
    if (input.up) {
      return null;
    }
    return new OnGroundState();
  }
  override update(entity: Entity, ecs: Ecs): void {}
}
