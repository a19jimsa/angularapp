import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../core/ecs';
import { Entity } from '../app/entity';
import { KeysPressed } from '../systems/controller-system';
import { AttackState } from './attack-state';
import { DamageState } from './damage-state';
import { JumpingState } from './jumping-state';
import { LoadArrowState } from './load-arrow-state';
import { RunningState } from './running-state';
import { State } from './state';
import { ResourceManager } from 'src/core/resource-manager';

export class OnGroundState extends State {
  override enter(entity: Entity, ecs: Ecs): void {
    console.log('On Ground');
    const transform = ecs.getComponent<Transform>(entity, 'Transform');
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (!skeleton) return;
    skeleton.rotation = 0;
    if (!transform) return;
    transform.velocity.X = 0;
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
