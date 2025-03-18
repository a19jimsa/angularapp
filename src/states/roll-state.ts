import { Entity } from 'src/app/entity';
import { Ecs } from 'src/core/ecs';
import { KeysPressed } from 'src/systems/controller-system';
import { StateMachine } from './state-machine';
import { Skeleton } from 'src/components/skeleton';
import { Transform } from 'src/components/transform';
import { ResourceManager } from 'src/core/resource-manager';
import { MathUtils } from 'src/Utils/MathUtils';
import { OnGroundState } from './on-ground-state';
import { Damage } from 'src/components/damage';
import { DamageState } from './damage-state';

export class RollState extends StateMachine {
  override enter(entity: Entity, ecs: Ecs): void {
    console.log('Rolling');

    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (skeleton) {
      skeleton.keyframes = ResourceManager.getAnimation(
        skeleton.resource,
        'roll'
      );
      skeleton.animationDuration =
        skeleton.keyframes[skeleton.keyframes.length - 1].time;
      skeleton.blend = true;
    }
    const transform = ecs.getComponent<Transform>(entity, 'Transform');
    transform.velocity.x = 5;
  }
  override exit(entity: Entity, ecs: Ecs): void {
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (!skeleton) return;
    const root = MathUtils.findBoneById(skeleton.bones, 'root');
    if (!root) return;
    root.rotation = -90;
  }
  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): StateMachine | null {
    const damage = ecs.getComponent<Damage>(entity, 'Damage');
    if (damage) {
      return new DamageState();
    }
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (!skeleton) return new OnGroundState();
    if (skeleton.elapsedTime >= skeleton.animationDuration) {
      return new OnGroundState();
    }
    return null;
  }
  override update(entity: Entity, ecs: Ecs): void {}
}
