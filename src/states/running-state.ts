import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../core/ecs';
import { Entity } from '../app/entity';
import { KeysPressed } from '../systems/controller-system';
import { StateMachine } from './state-machine';
import { OnGroundState } from './on-ground-state';
import { Run } from 'src/components/run';

export class RunningState extends StateMachine {
  override enter(entity: Entity, ecs: Ecs): void {
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (!skeleton) return;
    skeleton.startTime = performance.now();
    ecs.addComponent<Run>(entity, new Run());
    console.log('Running');
  }
  override exit(entity: Entity, ecs: Ecs): void {
    ecs.removeComponent<Run>(entity, 'Run');
  }
  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): StateMachine | null {
    let speedX = 0;
    const transform = ecs.getComponent<Transform>(entity, 'Transform');
    if (input.right) {
      speedX += 10;
    }
    if (input.left) {
      speedX += -10;
    }
    if (speedX !== 0) {
      transform.velocity.X = speedX;
      return null;
    }
    transform.velocity.X = speedX;
    return new OnGroundState();
  }
  override update(entity: Entity, ecs: Ecs): void {}
}
