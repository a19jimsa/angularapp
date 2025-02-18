import { Ecs } from '../core/ecs';
import { Entity } from '../app/entity';
import { KeysPressed } from '../systems/controller-system';
import { AttackState } from './attack-state';
import { DamageState } from './damage-state';
import { JumpingState } from './jumping-state';
import { LoadArrowState } from './load-arrow-state';
import { RunningState } from './running-state';
import { StateMachine } from './state-machine';
import { Idle } from 'src/components/idle';

export class OnGroundState extends StateMachine {
  override enter(entity: Entity, ecs: Ecs): void {
    ecs.addComponent<Idle>(entity, new Idle());
  }
  override exit(entity: Entity, ecs: Ecs): void {
    ecs.removeComponent<Idle>(entity, 'Idle');
  }
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
      return new DamageState();
    }
    return null;
  }
  override update(entity: Entity, ecs: Ecs): void {}
}
