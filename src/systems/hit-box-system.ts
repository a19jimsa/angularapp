import { HitBox } from '../components/hit-box';
import { Transform } from '../components/transform';
import { Ecs } from '../core/ecs';

export class HitBoxSystem {
  update(ecs: Ecs): void {
    for (const entity of ecs.getEntities()) {
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      const hitBox = ecs.getComponent<HitBox>(entity, 'HitBox');
      if (!transform || !hitBox) continue;
      hitBox.position.X = transform.position.X - hitBox.width / 2;
      hitBox.position.Y = transform.position.Y - hitBox.height;
    }
  }
}
