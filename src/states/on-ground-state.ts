import { Ecs } from '../core/ecs';
import { Entity } from '../app/entity';
import { KeysPressed } from '../systems/controller-system';
import { AttackState } from './attack-state';
import { JumpingState } from './jumping-state';
import { RunningState } from './running-state';
import { StateMachine } from './state-machine';
import { Skeleton } from 'src/components/skeleton';
import { ResourceManager } from 'src/core/resource-manager';
import { States } from 'src/components/state';
import { Transform } from 'src/components/transform';
import { Damage } from 'src/components/damage';
import { DamageState } from './damage-state';
import { RollState } from './roll-state';
import { LoadArrowState } from './load-arrow-state';

export class OnGroundState extends StateMachine {
  override enter(entity: Entity, ecs: Ecs): void {
    console.log('On Ground');
    const transform = ecs.getComponent<Transform>(entity, 'Transform');
    transform.velocity.x = 0;
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (!skeleton) return;
    skeleton.keyframes = ResourceManager.getAnimation(
      skeleton.resource,
      States.Idle
    );
    skeleton.takeSnapshot = true;
    skeleton.blend = true;
    skeleton.animationDuration =
      skeleton.keyframes[skeleton.keyframes.length - 1].time;
    skeleton.startTime = performance.now();
  }
  override exit(entity: Entity, ecs: Ecs): void {}

  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): StateMachine | null {
    const damage = ecs.getComponent<Damage>(entity, 'Damage');
    if (damage) {
      return new DamageState();
    }
    if (input.right || input.left) {
      return new RunningState();
    } else if (input.attack) {
      return new AttackState();
    } else if (input.jump) {
      return new JumpingState();
    } else if (input.up) {
      return new DamageState();
    } else if (input.roll) {
      return new RollState();
    } else if (input.up) {
      return new LoadArrowState();
    }
    return null;
  }
  override update(entity: Entity, ecs: Ecs): void {}
}
