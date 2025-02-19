import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../core/ecs';
import { Entity } from '../app/entity';
import { KeysPressed } from '../systems/controller-system';
import { OnGroundState } from './on-ground-state';
import { StateMachine } from './state-machine';
import { Attack } from 'src/components/attack';

export class AttackState extends StateMachine {
  frameTimer = 0;
  override enter(entity: Entity, ecs: Ecs): void {
    console.log('Attack');
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (skeleton) {
      skeleton.startTime = performance.now();
    }
    this.frameTimer = 0;
    ecs.addComponent<Attack>(entity, new Attack());
  }
  override exit(entity: Entity, ecs: Ecs): void {
    ecs.removeComponent<Attack>(entity, 'Attack');
  }
  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): StateMachine | null {
    if (this.frameTimer > 30) {
      return new OnGroundState();
    }
    return null;
  }
  override update(entity: Entity, ecs: Ecs): void {
    this.frameTimer++;
  }
}
