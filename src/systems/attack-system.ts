import { Ai } from 'src/components/ai';
import { Damage } from 'src/components/damage';
import { HitBox } from 'src/components/hit-box';
import { HurtBox } from 'src/components/hurt-box';
import { Ecs } from 'src/core/ecs';
import { MathUtils } from 'src/Utils/MathUtils';

export class AttackSystem {
  update(ecs: Ecs) {
    const playerpool = ecs.getPool<[HurtBox]>('HurtBox');
    playerpool.forEach(({ entity, components }) => {
      const [hurtBox] = components;
      for (const entity of ecs.getEntities()) {
        const hitBox = ecs.getComponent<HitBox>(entity, 'HitBox');
        const ai = ecs.getComponent<Ai>(entity, 'Ai');
        if (!hitBox || !ai) continue;
        if (MathUtils.isColliding(hitBox, hurtBox)) {
          ecs.addComponent<Damage>(entity, new Damage(0));
        }
      }
    });
  }
}
