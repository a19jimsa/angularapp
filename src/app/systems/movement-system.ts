import { Transform } from '../components/transform';
import { Ecs } from '../ecs';

export class MovementSystem {
  update(ecs: Ecs) {
    for (let entity of ecs.getEntities()) {
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      if (transform !== undefined) {
        transform.position.X += transform.velocity.X;
        transform.position.Y += transform.velocity.Y;
      }
    }
  }
}
