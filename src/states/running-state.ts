import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../core/ecs';
import { Entity } from '../app/entity';
import { KeysPressed } from '../systems/controller-system';
import { StateMachine } from './state-machine';
import { OnGroundState } from './on-ground-state';
import { JumpingState } from './jumping-state';
import { ResourceManager } from 'src/core/resource-manager';
import { States } from 'src/components/state';
import { Damage } from 'src/components/damage';
import { DamageState } from './damage-state';
import { MathUtils } from 'src/Utils/MathUtils';

export class RunningState extends StateMachine {
  override enter(entity: Entity, ecs: Ecs): void {
    console.log('Running');
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (skeleton) {
      skeleton.keyframes = ResourceManager.getAnimation(
        skeleton.resource,
        States.Running
      );
      MathUtils.createSnaphot(skeleton);
    }
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
    let speedX = 0;
    let speedY = 0;
    const transform = ecs.getComponent<Transform>(entity, 'Transform');
    if (!transform) return null;
    if (input.right) {
      speedX += 10;
    }
    if (input.left) {
      speedX -= 10;
    }
    transform.velocity.x = speedX;
    if (input.jump && (input.left || input.right)) {
      return new JumpingState();
    }
    if (speedX !== 0) {
      transform.velocity.x = speedX;
      return null;
    }
    return new OnGroundState();
  }
  override update(entity: Entity, ecs: Ecs): void {}
}
