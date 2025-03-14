import { StateMachine } from './state-machine';
import { Entity } from 'src/app/entity';
import { Skeleton } from 'src/components/skeleton';
import { States } from 'src/components/state';
import { Ecs } from 'src/core/ecs';
import { ResourceManager } from 'src/core/resource-manager';
import { KeysPressed } from 'src/systems/controller-system';

export class DeathState extends StateMachine {
  override enter(entity: Entity, ecs: Ecs): void {
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (!skeleton) return;
    skeleton.startTime = performance.now();
    skeleton.keyframes = ResourceManager.getAnimation(
      skeleton.resource,
      States.Dead
    );
  }
  override exit(entity: Entity, ecs: Ecs): void {}
  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): StateMachine | null {
    return null;
  }
  override update(entity: Entity, ecs: Ecs): void {}
}
