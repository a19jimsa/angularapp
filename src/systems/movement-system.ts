import { Transform } from '../components/transform';
import { Ecs } from '../core/ecs';

export class MovementSystem {
  update(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      if (!transform) continue;
      // transform.velocity.times(0.995);
      // if (transform.velocity.mag() < 2) {
      //   transform.velocity.times(0.94);
      // }
      transform.position.X += transform.velocity.X;
      transform.position.Y += transform.velocity.Y;
    }
  }
}
