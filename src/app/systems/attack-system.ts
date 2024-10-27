import { Attack } from '../components/attack';
import { Ecs } from '../ecs';
import { Renderer } from '../renderer';
import { Bone } from '../components/bone';
import { Weapon } from '../components/weapon';
import { Skeleton } from '../components/skeleton';

export class AttackSystem {
  update(ecs: Ecs, renderer: Renderer): void {
    const pool = ecs.getPool<[Attack, Weapon, Skeleton]>(
      'Attack',
      'Weapon',
      'Skeleton'
    );
    const skeletonPool = ecs.getPool<[Skeleton]>('Skeleton');
    for (const [attack, weapon, skeleton] of pool) {
      const weaponX =
        weapon.position.X +
        weapon.length * Math.cos((weapon.rotation * Math.PI) / 180);
      const weaponY =
        weapon.position.Y +
        weapon.length * Math.sin((weapon.rotation * Math.PI) / 180);
      attack.position.X = weaponX;
      attack.position.Y = weaponY;

      if (skeleton.flip) {
        attack.position.X =
          skeleton.position.X + (skeleton.position.X - weaponX);
        attack.position.X -= attack.width;
      }
      renderer.drawAttackBox(attack);
      for (const [skeleton] of skeletonPool) {
        for (const bone of skeleton.bones) {
          if (this.isColliding(attack, bone)) {
            console.log('Hitted ' + bone.id);
            return;
          }
        }
      }
    }
  }

  // Kontrollera om två hitboxar kolliderar (rektangel-baserad kollision)
  isColliding(attack: Attack, bone: Bone): boolean {
    return (
      attack.position.X < bone.position.X + bone.endX &&
      attack.position.X + attack.width > bone.position.X &&
      attack.position.Y < bone.position.Y + bone.endY &&
      attack.position.Y + attack.height > bone.position.Y
    );
  }
}
