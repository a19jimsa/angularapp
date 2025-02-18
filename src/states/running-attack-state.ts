import { Enemy } from '../components/enemy';
import { Skeleton } from '../components/skeleton';
import { Ecs } from '../core/ecs';
import { Entity } from '../app/entity';
import { KeysPressed } from '../systems/controller-system';
import { OnGroundState } from './on-ground-state';
import { StateMachine } from './state-machine';

export class RunningAttackState extends StateMachine {
  override enter(entity: Entity, ecs: Ecs): void {
    const skeleton = ecs.getComponent<Skeleton>(Enemy, 'Skeleton');
    if (!skeleton) return;
    skeleton.startTime = performance.now();
  }
  override exit(entity: Entity, ecs: Ecs): void {}
  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): StateMachine | null {
    if (input.attack && (input.right || input.left)) {
      return null;
    }
    return new OnGroundState();
  }
  override update(entity: Entity, ecs: Ecs): void {}
}
