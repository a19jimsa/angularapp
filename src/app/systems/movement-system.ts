import { Transform } from '../components/transform';
import { Ecs } from '../ecs';

export class MovementSystem {
  update(ecs: Ecs) {
    for (let entity of ecs.getEntities()) {
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      if (transform !== undefined) {
        //transform.velocity.times(0.995);
        // if (transform.velocity.mag() < 2) {
        //   transform.velocity.times(0.94);
        // }
        transform.position.X += transform.velocity.X;
        transform.position.Y += transform.velocity.Y;
      }
    }
  }
}
