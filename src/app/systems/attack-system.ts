import { Ecs } from '../ecs';
import { Bone } from '../components/bone';
import { Weapon } from '../components/weapon';
import { Skeleton } from '../components/skeleton';
import { HitBox } from '../components/hit-box';
import { Vec } from '../vec';
import { Transform } from '../components/transform';
import { MathUtils } from '../Util/MathUtils';

export class AttackSystem {
  update(ecs: Ecs): void {
    for (const entity of ecs.getEntities()) {
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
      const hitBox = ecs.getComponent<HitBox>(entity, 'HitBox');
      if (!skeleton || !skeleton.heldEntity) continue;
      const weapon = ecs.getComponent<Weapon>(skeleton.heldEntity, 'Weapon');
      if (!hitBox) {
        ecs.addComponent<HitBox>(entity, new HitBox(new Vec(0, 0), 50, 50));
        continue;
      }
      const position = MathUtils.calculateParentPosition(
        weapon.offset,
        (weapon.image.height - (weapon.image.height - weapon.pivot.Y)) *
          weapon.scale.Y,
        weapon.rotation - 180
      );
      hitBox.position = transform.position.plus(position);
      if (skeleton.flip) {
        hitBox.position.X =
          transform.position.X -
          (hitBox.position.X - transform.position.X) -
          50;
      }
    }
  }

  // Kontrollera om två hitboxar kolliderar (rektangel-baserad kollision)
  isColliding(hitbox: HitBox, bone: Bone): boolean {
    return (
      hitbox.position.X < bone.position.X + bone.endX &&
      hitbox.position.X + hitbox.width > bone.position.X &&
      hitbox.position.Y < bone.position.Y + bone.endY &&
      hitbox.position.Y + hitbox.height > bone.position.Y
    );
  }
}
