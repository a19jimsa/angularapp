import { HurtBox } from '../components/hurt-box';
import { Transform } from '../components/transform';
import { Weapon } from '../components/weapon';
import { Ecs } from '../core/ecs';
import { MathUtils } from '../Utils/MathUtils';

export class HurtBoxSystem {
  update(ecs: Ecs) {
    const pool = ecs.getPool<[Transform, HurtBox, Weapon]>(
      'Transform',
      'HurtBox',
      'Weapon'
    );
    for (const [transform, hurtBox, weapon] of pool) {
      const newPos = MathUtils.calculateParentPosition(
        transform.position,
        weapon.image.height - 25,
        weapon.rotation
      );
      hurtBox.width = weapon.image.width;
      hurtBox.height = weapon.image.height;
      hurtBox.position.X = newPos.X;
      hurtBox.position.Y = newPos.Y;
      if (weapon.flip) {
        hurtBox.position = MathUtils.calculateParentPosition(
          transform.position,
          -weapon.image.height,
          weapon.rotation
        );
      }
    }
  }
}
