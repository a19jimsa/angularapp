import { Skeleton } from '../components/skeleton';
import { Ecs } from '../core/ecs';
import { Entity } from '../app/entity';
import { KeysPressed } from '../systems/controller-system';
import { OnGroundState } from './on-ground-state';
import { StateMachine } from './state-machine';
import { Attack } from 'src/components/attack';
import { Jump } from 'src/components/jump';
import { JumpingState } from './jumping-state';

export class JumpAttackState extends StateMachine {
  frameTimer = 0;
  override enter(entity: Entity, ecs: Ecs): void {
    console.log('Attack');
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (skeleton) {
      skeleton.startTime = performance.now();
    }
    this.frameTimer = 0;
    ecs.addComponent<Attack>(entity, new Attack());
    ecs.addComponent<Jump>(entity, new Jump());
  }
  override exit(entity: Entity, ecs: Ecs): void {
    ecs.removeComponent<Jump>(entity, 'Jump');
    ecs.removeComponent<Attack>(entity, 'Attack');
  }
  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): StateMachine | null {
    if (this.frameTimer > 60) {
      return new OnGroundState();
    }
    return null;
  }
  override update(entity: Entity, ecs: Ecs): void {
    this.frameTimer++;
  }
}
