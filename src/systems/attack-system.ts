import { Enemy } from 'src/components/enemy';
import { HitBox } from 'src/components/hit-box';
import { HurtBox } from 'src/components/hurt-box';
import { Weapon } from 'src/components/weapon';
import { Ecs } from 'src/core/ecs';
import { MathUtils } from 'src/Utils/MathUtils';

export class AttackSystem {
  update(ecs: Ecs) {
    const playerpool = ecs.getPool<[Weapon, HurtBox]>('Weapon', 'HurtBox');
    const enemypool = ecs.getPool<[HitBox, Enemy]>('HitBox', 'Enemy');
    for (const [weapon, hurtBox] of playerpool) {
      for (const [enemyhitBox, enemy] of enemypool) {
        if (MathUtils.isColliding(enemyhitBox, hurtBox)) {
          console.log('I AM HITTED');
          
          break;
        }
      }
    }
  }
}
