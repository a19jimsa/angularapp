import { Transform } from '../components/transform';
import { Ecs } from '../core/ecs';
import { Entity } from '../app/entity';
import { KeysPressed } from '../systems/controller-system';
import { OnGroundState } from './on-ground-state';
import { StateMachine } from './state-machine';
import { Damage } from 'src/components/damage';

export class DamageState extends StateMachine {
  frameTime = 0;
  override enter(entity: Entity, ecs: Ecs): void {
    const transform = ecs.getComponent<Transform>(entity, 'Transform');
    if (!transform) return;
    transform.velocity.X = 0;
    ecs.addComponent<Damage>(entity, new Damage());
  }
  override exit(entity: Entity, ecs: Ecs): void {
    ecs.removeComponent<Damage>(entity, 'Damage');
  }
  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): StateMachine | null {
    if (input.down) {
      return null;
    }
    return new OnGroundState();
  }
  override update(entity: Entity, ecs: Ecs): void {
    this.frameTime++;
  }
}
