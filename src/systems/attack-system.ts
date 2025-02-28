import { Damage } from 'src/components/damage';
import { HitBox } from 'src/components/hit-box';
import { HurtBox } from 'src/components/hurt-box';
import { Life } from 'src/components/life';
import { Player } from 'src/components/player';
import { Ecs } from 'src/core/ecs';
import { MathUtils } from 'src/Utils/MathUtils';

export class AttackSystem {
  update(ecs: Ecs) {
    const playerpool = ecs.getPool<[HurtBox]>('HurtBox');
    playerpool.forEach(({ entity, components }) => {
      const [hurtBox] = components;
      for (const entity of ecs.getEntities()) {
        const hitBox = ecs.getComponent<HitBox>(entity, 'HitBox');
        const player = ecs.getComponent<Player>(entity, 'Player');
        const life = ecs.getComponent<Life>(entity, 'Life');
        if (!hitBox || !player || !life) continue;
        if (MathUtils.isColliding(hitBox, hurtBox)) {
          console.log('I am hit');
          ecs.addComponent<Damage>(entity, new Damage(120));
          life.currentHp -= 10;
          console.log(life.currentHp);
        }
      }
    });
  }
}
