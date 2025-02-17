import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../core/ecs';
import { Entity } from '../app/entity';
import { KeysPressed } from '../systems/controller-system';
import { OnGroundState } from './on-ground-state';
import { State } from './state';
import { ResourceManager } from 'src/core/resource-manager';
import { Weapon } from 'src/components/weapon';
import { Projectile } from 'src/components/projectile';
import { MathUtils } from 'src/Utils/MathUtils';

export class LoadArrowState extends State {
  frameTime = 0;
  override enter(entity: Entity, ecs: Ecs): void {
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (!skeleton) return;
    skeleton.startTime = performance.now();
    skeleton.heldEntity = 14;
    this.frameTime = 0;
  }
  override exit(entity: Entity, ecs: Ecs): void {}
  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): State | null {
    if (input.up) {
      return null;
    }
    return new OnGroundState();
  }
  override update(entity: Entity, ecs: Ecs): void {
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (this.frameTime >= 120) {
      if (skeleton) {
        if (skeleton.heldEntity) {
          const transform = ecs.getComponent<Transform>(
            skeleton.heldEntity,
            'Transform'
          );
          const weapon = ecs.getComponent<Weapon>(
            skeleton.heldEntity,
            'Weapon'
          );
          transform.velocity.X =
            Math.cos(MathUtils.degreesToRadians(weapon.rotation)) * 10;
          transform.velocity.Y =
            Math.sin(MathUtils.degreesToRadians(weapon.rotation)) * 10;
          ecs.addComponent<Projectile>(skeleton.heldEntity, new Projectile());
          skeleton.heldEntity = null;
        }
        console.log(ecs);
      }
    }
    this.frameTime++;
  }
}
