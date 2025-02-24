import { StateMachine } from './state-machine';
import { Entity } from 'src/app/entity';
import { Dead } from 'src/components/dead';
import { Skeleton } from 'src/components/skeleton';
import { Ecs } from 'src/core/ecs';
import { KeysPressed } from 'src/systems/controller-system';

export class DeathState extends StateMachine {
  override enter(entity: Entity, ecs: Ecs): void {
    ecs.addComponent<Dead>(entity, new Dead());
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (!skeleton) return;
    skeleton.startTime = performance.now();
  }
  override exit(entity: Entity, ecs: Ecs): void {
    ecs.removeComponent<Dead>(entity, 'Dead');
  }
  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): StateMachine | null {
    return null;
  }
  override update(entity: Entity, ecs: Ecs): void {
    
  }
}
