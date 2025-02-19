import { Skeleton } from '../components/skeleton';
import { Ecs } from '../core/ecs';
import { Weapon } from '../components/weapon';
import { Transform } from '../components/transform';
import { Entity } from 'src/app/entity';

export class WeaponSystem {
  update(ecs: Ecs) {
    const pool = ecs.getPool<[Transform, Skeleton]>('Transform', 'Skeleton');
    for (const [transform, skeleton] of pool) {
      if (skeleton.heldEntity) {
        this.updateWeaponPosition(
          transform,
          skeleton.heldEntity,
          ecs,
          skeleton
        );
      }
      if (skeleton.heldOffhandEntity) {
        this.updateWeaponPosition(
          transform,
          skeleton.heldOffhandEntity,
          ecs,
          skeleton
        );
      }
    }
  }

  updateWeaponPosition(
    transform: Transform,
    entity: Entity,
    ecs: Ecs,
    skeleton: Skeleton
  ) {
    if (entity) {
      const weapon = ecs.getComponent<Weapon>(entity, 'Weapon');
      const weaponTransform = ecs.getComponent<Transform>(entity, 'Transform');
      if (!weapon && !weaponTransform) return;
      const parent = skeleton.bones.find((e) => e.id === weapon.parentId);
      if (parent) {
        weaponTransform.position.X = transform.position.X + parent.position.X;
        weaponTransform.position.Y = transform.position.Y + parent.position.Y;
        weapon.rotation =
          parent.globalRotation + parent.globalSpriteRotation - 180;
        weapon.order = parent.order - 1;
        weapon.scale = parent.scale;
      }
      if (skeleton.flip) {
        weaponTransform.position.X =
          transform.position.X +
          (transform.position.X - weaponTransform.position.X);

        weapon.rotation = -weapon.rotation - 180;
        weapon.scale.X = -1;
      }
      weapon.flip = skeleton.flip;
    }
  }
}
