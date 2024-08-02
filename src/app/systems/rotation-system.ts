import { Rotation } from '../components/rotation';
import { Transform } from '../components/transform';
import { Ecs } from '../ecs';

export class RotationSystem {
  update(ecs: Ecs) {
    for (let entity of ecs.getEntities()) {
      const rotation = ecs.getComponent<Rotation>(entity, 'Rotation');
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      if (rotation !== undefined && transform !== undefined) {
        transform.velocity.X -= rotation.rotation * 0.01 * transform.velocity.Y;
        rotation.angle += rotation.rotation;
        rotation.rotation *= 0.99;
      }
    }
  }
}
