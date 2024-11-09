import { HitBox } from '../components/hit-box';
import { Ecs } from '../ecs';
import { Renderer } from '../renderer';

export class HitBoxSystem {
  update(ecs: Ecs, renderer: Renderer) {
    const pool = ecs.getPool<[HitBox]>('HitBox');
    for (const [hitbox] of pool) {
      renderer.drawHitBox(hitbox);
    }
  }
}
