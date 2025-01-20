import { Skeleton } from '../components/skeleton';
import { Ecs } from '../ecs';
import { Weapon } from '../components/weapon';

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
          weapon.position.X = skeleton.position.X;
          weapon.position.Y = skeleton.position.Y;
          weapon.offset = parent.offset;
          weapon.rotation = parent.globalRotation;
          weapon.order = parent.order - 1;
        }
      }
    }
  }
}
