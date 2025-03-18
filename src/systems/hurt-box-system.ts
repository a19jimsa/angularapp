import { Vec } from 'src/app/vec';
import { HurtBox } from '../components/hurt-box';
import { Transform } from '../components/transform';
import { Weapon } from '../components/weapon';
import { Ecs } from '../core/ecs';
import { MathUtils } from '../Utils/MathUtils';
import { HitBox } from 'src/components/hit-box';
import { Sprite } from 'src/components/sprite';

export class HurtBoxSystem {
  update(ecs: Ecs) {
    const pool = ecs.getPool<[Transform, HurtBox, Weapon, Sprite]>(
      'Transform',
      'HurtBox',
      'Weapon',
      'Sprite'
    );
    pool.forEach(({ entity, components }) => {
      const [transform, hurtBox, weapon, sprite] = components;
      const newTransform = new Vec(transform.position.x, transform.position.y);
      const newPos = MathUtils.calculateParentPosition(
        newTransform,
        (sprite.image.height - (weapon.pivot.y + sprite.image.height)) *
          weapon.scale.y,
        weapon.rotation
      );
      hurtBox.width = 10;
      hurtBox.height = 10;
      hurtBox.position.x = newPos.x;
      hurtBox.position.y = newPos.y;
      for (const otherEntity of ecs.getEntities()) {
        if (entity === otherEntity) continue;
        const hitBox = ecs.getComponent<HitBox>(otherEntity, 'HitBox');
        if (!hitBox) continue;
        if (MathUtils.isColliding(hitBox, hurtBox)) {
          //TODO calculate damage to target
          continue;
        }
      }
    });
  }
}
