import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../ecs';
import { Entity } from '../entity';
import { KeysPressed } from '../systems/controller-system';
import { AttackState } from './attack-state';
import { DamageState } from './damage-state';
import { JumpingState } from './jumping-state';
import { LoadArrowState } from './load-arrow-state';
import { RunningState } from './running-state';
import { State } from './state';

export class OnGroundState extends State {
  constructor() {
    super('assets/json/idle.json');
  }
  override enter(entity: Entity, ecs: Ecs): void {
    const transform = ecs.getComponent<Transform>(entity, 'Transform');
    if (transform) {
      transform.velocity.X = 0;
      transform.velocity.Y = 0;
    }
    console.log('On Ground');
  }
  override exit(entity: Entity, ecs: Ecs): void {}
  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): State | null {
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
