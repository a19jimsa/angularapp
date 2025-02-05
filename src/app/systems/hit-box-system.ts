import { Bone } from '../components/bone';
import { HitBox } from '../components/hit-box';
import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Weapon } from '../components/weapon';
import { Ecs } from '../ecs';
import { MathUtils } from '../Utils/MathUtils';

export class HitBoxSystem {
  update(ecs: Ecs): void {
    // for (const entity of ecs.getEntities()) {
    //   //On skeleton components
    //   const transform = ecs.getComponent<Transform>(entity, 'Transform');
    //   const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    //   if (!skeleton || !skeleton.heldEntity) continue;
    //   //On weapon components
    //   const weapon = ecs.getComponent<Weapon>(skeleton.heldEntity, 'Weapon');
    //   const weaponTransform = ecs.getComponent<Transform>(weapon, 'Transform');
    //   const hitBox = ecs.getComponent<HitBox>(skeleton.heldEntity, 'HitBox');
    //   if (!hitBox) {
    //     ecs.addComponent<HitBox>(skeleton.heldEntity, new HitBox(50, 50));
    //     continue;
    //   }
    //   if (!weapon && !weaponTransform) continue;
    //   const position = MathUtils.calculateParentPosition(
    //     transform.position,
    //     (weapon.image.height - (weapon.image.height - weapon.pivot.Y)) *
    //       weapon.scale.Y,
    //     weapon.rotation - 180
    //   );
    //   weaponTransform.position = position;
    // }
  }
}
