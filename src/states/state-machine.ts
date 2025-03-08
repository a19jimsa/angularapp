import { Entity } from 'src/app/entity';
import { Ecs } from 'src/core/ecs';
import { KeysPressed } from 'src/systems/controller-system';

export abstract class StateMachine {
  abstract enter(entity: Entity, ecs: Ecs): void;
  abstract exit(entity: Entity, ecs: Ecs): void;
  abstract handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): StateMachine | null;
  abstract update(entity: Entity, ecs: Ecs): void;
}
