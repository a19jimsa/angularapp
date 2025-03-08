import { Vec } from 'src/app/vec';
import { Damage } from 'src/components/damage';
import { Effect } from 'src/components/effect';
import { Enemy } from 'src/components/enemy';
import { HitBox } from 'src/components/hit-box';
import { HurtBox } from 'src/components/hurt-box';
import { Knockback } from 'src/components/knockback';
import { Life } from 'src/components/life';
import { Player } from 'src/components/player';
import { Ragdoll } from 'src/components/ragdoll';
import { Transform } from 'src/components/transform';
import { Weapon } from 'src/components/weapon';
import { Ecs } from 'src/core/ecs';
import { MathUtils } from 'src/Utils/MathUtils';

export class AttackSystem {
  update(ecs: Ecs) {
    const weaponPool = ecs.getPool<[HurtBox, Weapon]>('HurtBox', 'Weapon');
    weaponPool.forEach(({ entity, components }) => {
      const [hurtBox, weapon] = components;
      const playerWeapon = ecs.getComponent<Weapon>(entity, 'Player');
      const enemyWeapon = ecs.getComponent<Enemy>(entity, 'Enemy');
      for (const otherEntity of ecs.getEntities()) {
        const hitBox = ecs.getComponent<HitBox>(otherEntity, 'HitBox');
        const player = ecs.getComponent<Player>(otherEntity, 'Player');
        const enemy = ecs.getComponent<Enemy>(otherEntity, 'Enemy');
        const life = ecs.getComponent<Life>(otherEntity, 'Life');
        if (playerWeapon && player) continue;
        if (enemyWeapon && enemy) continue;
        if (!hitBox || !life) continue;
        if (MathUtils.isColliding(hitBox, hurtBox)) {
          console.log('I am hit');
          ecs.addComponent<Damage>(otherEntity, new Damage(120));
          const radians = MathUtils.degreesToRadians(weapon.rotation);
          const x = Math.cos(radians);
          const y = Math.sin(radians);
          ecs.addComponent<Knockback>(
            otherEntity,
            new Knockback(new Vec(x * -5, y * -5))
          );
          const transform = ecs.getComponent<Transform>(
            otherEntity,
            'Transform'
          );
          ecs.addComponent<Ragdoll>(otherEntity, new Ragdoll(10));
          ecs.addComponent<Effect>(
            otherEntity,
            new Effect(
              'assets/sprites/Btl_Hit01.png',
              transform.position,
              'smash'
            )
          );
          life.currentHp -= 10;
        }
      }
    });
  }
}
