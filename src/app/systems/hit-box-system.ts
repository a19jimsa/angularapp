import { HitBox } from '../components/hit-box';
import { Rotation } from '../components/rotation';
import { Ecs } from '../ecs';
import { Renderer } from '../renderer';

export class HitBoxSystem {
  update(ecs: Ecs, renderer: Renderer) {
    const pool = ecs.getPool<[HitBox, Rotation]>('HitBox', 'Rotation');
    for (const [hitbox, rotation] of pool) {
      renderer.drawHitBox(hitbox, rotation);
    }
  }
}
