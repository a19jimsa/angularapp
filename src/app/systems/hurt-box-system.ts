import { HurtBox } from '../components/hurt-box';
import { Transform } from '../components/transform';
import { Ecs } from '../ecs';

export class HurtBoxSystem {
  update(ecs: Ecs) {
    const pool = ecs.getPool<[Transform, HurtBox]>('Transform', 'HurtBox');
    for (const [transform, hurtBox] of pool) {
      //Dereference
      const x = transform.position.X;
      const y = transform.position.Y;
      hurtBox.position.X = x;
      hurtBox.position.Y = y;
      hurtBox.width = 100;
      hurtBox.height = 150;
      hurtBox.position.X -= hurtBox.width / 2;
      hurtBox.position.Y -= hurtBox.height / 2;
    }
  }
}
