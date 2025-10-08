import { Transform3D } from 'src/components/transform3D';
import { Transform } from '../components/transform';
import { Ecs } from '../core/ecs';

export class MovementSystem {
  update(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      const transform3D = ecs.getComponent<Transform3D>(entity, 'Transform3D');
      if (!transform) continue;
      // transform.velocity.times(0.995);
      // if (transform.velocity.mag() < 2) {
      //   transform.velocity.times(0.94);
      // }
      transform.position.x += transform.velocity.x;
      transform.position.y += transform.velocity.y;
    }
  }
}
