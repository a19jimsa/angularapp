import { HurtBox } from '../components/hurt-box';
import { Transform } from '../components/transform';
import { Weapon } from '../components/weapon';
import { Ecs } from '../core/ecs';
import { MathUtils } from '../app/Utils/MathUtils';

export class HurtBoxSystem {
  update(ecs: Ecs) {
    const pool = ecs.getPool<[Transform, HurtBox, Weapon]>(
      'Transform',
      'HurtBox',
      'Weapon'
    );
    for (const [transform, hurtBox, weapon] of pool) {
      //Dereference
      const newPos = MathUtils.calculateParentPosition(
        transform.position,
        weapon.image.height - 25,
        weapon.rotation - 180
      );
      hurtBox.width = 50;
      hurtBox.height = 50;
      hurtBox.position.X = newPos.X;
      hurtBox.position.Y = newPos.Y;
      if (weapon.scale.Y === -1) {
        hurtBox.position = MathUtils.calculateParentPosition(
          transform.position,
          -weapon.image.height + 25,
          weapon.rotation - 180
        );
      }
    }
  }
}
