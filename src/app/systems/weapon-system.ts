import { Skeleton } from '../components/skeleton';
import { Ecs } from '../ecs';
import { Weapon } from '../components/weapon';
import { Transform } from '../components/transform';

export class WeaponSystem {
  update(ecs: Ecs) {
    const pool = ecs.getPool<[Transform, Skeleton]>('Transform', 'Skeleton');
    for (const [transform, skeleton] of pool) {
      if (skeleton.heldEntity) {
        const entity = skeleton.heldEntity;
        const weapon = ecs.getComponent<Weapon>(entity, 'Weapon');
        const weaponTransform = ecs.getComponent<Transform>(
          entity,
          'Transform'
        );
        if (!weapon && !weaponTransform) return;
        const parent = skeleton.bones.find((e) => e.id === weapon.parentId);
        if (parent) {
          weaponTransform.position.X = transform.position.X + parent.position.X;
          weaponTransform.position.Y = transform.position.Y + parent.position.Y;
          weapon.rotation =
            parent.rotation +
            parent.globalRotation +
            parent.globalSpriteRotation -
            90;
          weapon.order = parent.order - 1;
          weapon.scale = parent.scale;
          if (skeleton.flip) {
            weaponTransform.position.X =
              transform.position.X +
              (transform.position.X - weaponTransform.position.X);

            weapon.rotation = -weapon.rotation;
            console.log(weapon.rotation);
            weapon.scale.Y = -1;
          }
        }
      }
      if (skeleton.heldOffhandEntity) {
        const entity = skeleton.heldOffhandEntity;
        const weapon = ecs.getComponent<Weapon>(entity, 'Weapon');
        const weaponTransform = ecs.getComponent<Transform>(
          entity,
          'Transform'
        );
        if (!weapon && !weaponTransform) return;
        const parent = skeleton.bones.find((e) => e.id === weapon.parentId);
        if (parent) {
          weaponTransform.position.X = transform.position.X;
          weaponTransform.position.Y = transform.position.Y;
          weapon.rotation =
            parent.rotation +
            parent.globalRotation +
            parent.globalSpriteRotation -
            90;
          weapon.order = parent.order - 1;
          weapon.scale = parent.scale;
        }
      }
    }
  }
}
