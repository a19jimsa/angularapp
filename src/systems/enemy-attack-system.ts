import { Ai } from 'src/components/ai';
import { Attack } from 'src/components/attack';
import { Damage } from 'src/components/damage';
import { HitBox } from 'src/components/hit-box';
import { HurtBox } from 'src/components/hurt-box';
import { Target } from 'src/components/target';
import { Ecs } from 'src/core/ecs';
import { MathUtils } from 'src/Utils/MathUtils';

export class EnemyAttackSystem {
  update(ecs: Ecs) {
    const pool = ecs.getPool<[HitBox, Ai, Target, Attack]>(
      'HitBox',
      'Ai',
      'Target',
      'Attack'
    );
    pool.forEach(({ entity, components }) => {
      const [hitBox, ai, target, attack] = components;
      if (target.player) {
        const player = target.player;
        const playerHurtbox = ecs.getComponent<HurtBox>(player, 'HurtBox');
        if (playerHurtbox) {
          if (MathUtils.isColliding(hitBox, playerHurtbox)) {
            //ecs.addComponent<Damage>(player, new Damage(120));
          }
        }
      }
    });
  }
}
