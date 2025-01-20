import { Ecs } from '../ecs';
import { Renderer } from '../renderer';
import { Bone } from '../components/bone';
import { Weapon } from '../components/weapon';
import { Skeleton } from '../components/skeleton';
import { HitBox } from '../components/hit-box';
import { Attack } from '../components/attack';

export class AttackSystem {
  update(ecs: Ecs, renderer: Renderer): void {
    const pool = ecs.getPool<[Weapon, Attack, Skeleton]>(
      'Weapon',
      'Attack',
      'Skeleton'
    );
    // for (const [weapon, attack, skeleton] of pool) {
    //   const weaponX =
    //     weapon.position.X +
    //     weapon.length * Math.cos((weapon.rotation * Math.PI) / 180);
    //   const weaponY =
    //     weapon.position.Y +
    //     weapon.length * Math.sin((weapon.rotation * Math.PI) / 180);
    //   const hitBox = new HitBox(
    //     new Vec(weaponX, weaponY),
    //     weapon.width,
    //     weapon.height
    //   );
    //   if (skeleton.flip) {
    //     weapon.position.X =
    //       skeleton.position.X + (skeleton.position.X - weaponX);
    //     weapon.position.X -= weapon.width;
    //     hitBox.position.X = weapon.position.X;
    //   }

    //   renderer.drawAttackBox(hitBox);
    //   for (const [weapon, attack, skeleton] of pool) {
    //     for (const bone of skeleton.bones) {
    //       if (this.isColliding(hitBox, bone)) {
    //         console.log('Hitted ' + bone.id);
    //         return;
    //       }
    //     }
    //   }
    // }
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
