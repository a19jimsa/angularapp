import { Skeleton } from '../components/skeleton';
import { Ecs } from '../ecs';
import { Weapon } from '../components/weapon';
import { MathUtils } from '../Util/MathUtils';

export class WeaponSystem {
  update(ecs: Ecs) {
    const pool = ecs.getPool<[Skeleton]>('Skeleton');
    for (const [skeleton] of pool) {
      if (skeleton.heldEntity) {
        const entity = skeleton.heldEntity;
        const weapon = ecs.getComponent<Weapon>(entity, 'Weapon');
        if (!weapon) return;
        const parent = skeleton.bones.find((e) => e.id === weapon.parentId);
        if (parent) {
          weapon.offset.X = parent.position.X;
          weapon.offset.Y = parent.position.Y;
          weapon.rotation = parent.globalRotation;
          weapon.order = parent.order - 1;
          weapon.scale = parent.scale;
        }
      }
      if (skeleton.heldOffhandEntity) {
        const entity = skeleton.heldOffhandEntity;
        const weapon = ecs.getComponent<Weapon>(entity, 'Weapon');
        if (!weapon) return;
        const parent = skeleton.bones.find((e) => e.id === weapon.parentId);
        if (parent) {
          weapon.offset.X = parent.position.X;
          weapon.offset.Y = parent.position.Y;
          weapon.rotation = parent.globalRotation;
          weapon.order = parent.order - 1;
          weapon.scale = parent.scale;
        }
      }
    }
  }
}
