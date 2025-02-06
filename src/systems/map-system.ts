import { HitBox } from '../components/hit-box';
import { Sprite } from '../components/sprite';
import { Transform } from '../components/transform';
import { Ecs } from '../core/ecs';

export class MapSystem {
  update(ecs: Ecs) {
    const pool = ecs.getPool<[Sprite, Transform, HitBox]>(
      'Sprite',
      'Transform',
      'HitBox'
    );
    for (const [sprite, transform, hitbox] of pool) {
      transform.position.Y = transform.position.Y - sprite.image.height;
    }
  }
}
