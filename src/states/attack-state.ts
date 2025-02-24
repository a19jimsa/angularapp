import { Skeleton } from '../components/skeleton';
import { Ecs } from '../core/ecs';
import { Entity } from '../app/entity';
import { KeysPressed } from '../systems/controller-system';
import { StateMachine } from './state-machine';
import { ResourceManager } from 'src/core/resource-manager';
import { States } from 'src/components/state';
import { Attack } from 'src/components/attack';
import { AttackDuration } from 'src/components/attack-duration';
import { OnGroundState } from './on-ground-state';

export class AttackState extends StateMachine {
  override enter(entity: Entity, ecs: Ecs): void {
    console.log('Attack');
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (skeleton) {
      skeleton.startTime = performance.now();
      skeleton.keyframes = ResourceManager.getAnimation(
        skeleton,
        States.Attacking
      );

      ecs.addComponent<AttackDuration>(
        entity,
        new AttackDuration(skeleton.animationDuration)
      );
    }
  }
  override exit(entity: Entity, ecs: Ecs): void {
    ecs.removeComponent<AttackDuration>(entity, 'AttackDuration');
  }
  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): StateMachine | null {
    const attackDuration = ecs.getComponent<AttackDuration>(
      entity,
      'AttackDuration'
    );
    if (!attackDuration) return new OnGroundState();
    if (attackDuration.cooldown <= 0) {
      return new OnGroundState();
    }
    return null;
  }
  override update(entity: Entity, ecs: Ecs): void {
    const attackDuration = ecs.getComponent<AttackDuration>(
      entity,
      'AttackDuration'
    );
    if (attackDuration) attackDuration.cooldown -= 0.016;
  }
}
