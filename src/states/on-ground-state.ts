import { Ecs } from '../core/ecs';
import { Entity } from '../app/entity';
import { KeysPressed } from '../systems/controller-system';
import { AttackState } from './attack-state';
import { JumpingState } from './jumping-state';
import { LoadArrowState } from './load-arrow-state';
import { RunningState } from './running-state';
import { StateMachine } from './state-machine';
import { DeathState } from './death-state';
import { Skeleton } from 'src/components/skeleton';
import { ResourceManager } from 'src/core/resource-manager';
import { States } from 'src/components/state';
import { Transform } from 'src/components/transform';

export class OnGroundState extends StateMachine {
  override enter(entity: Entity, ecs: Ecs): void {
    console.log('On Ground');
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    const transform = ecs.getComponent<Transform>(entity, 'Transform');
    if (!skeleton) return;
    skeleton.keyframes = ResourceManager.getAnimation(skeleton, States.Idle);
    transform.velocity.X = 0;
  }
  override exit(entity: Entity, ecs: Ecs): void {}
  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): StateMachine | null {
    if (input.right || input.left) {
      return new RunningState();
    } else if (input.attack) {
      return new AttackState();
    } else if (input.jump) {
      return new JumpingState();
    } else if (input.up) {
      return new LoadArrowState();
    } else if (input.down) {
      return new DeathState();
    }
    return null;
  }
  override update(entity: Entity, ecs: Ecs): void {}
}
