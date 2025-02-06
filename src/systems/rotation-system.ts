import { Rotation } from '../components/rotation';
import { Transform } from '../components/transform';
import { Ecs } from '../core/ecs';

export class RotationSystem {
  update(ecs: Ecs) {
    for (let entity of ecs.getEntities()) {
      const rotation = ecs.getComponent<Rotation>(entity, 'Rotation');
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      if (rotation && transform) {
        //transform.velocity.X = rotation.angle * transform.velocity.Y;
        rotation.angle += rotation.speed;
        console.log(rotation.angle);
      }
    }
  }
}
