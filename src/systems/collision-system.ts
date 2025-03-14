import { Transform } from '../components/transform';
import { Ecs } from '../core/ecs';
import { Scene } from '../app/scene';

export class CollisionSystem {
  update(ecs: Ecs, scene: Scene): void {
    for (let i = 0; i < ecs.getEntities().length; i++) {
      let entity = ecs.getEntities()[i];
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      if (transform !== undefined) {
        if (transform.position.x > scene.width - transform.radius) {
          transform.position.x = scene.width - transform.radius;
          transform.velocity.x *= -1;
          transform.velocity.x *= 0.5;
        } else if (transform.position.x < 0 + transform.radius) {
          transform.position.x = transform.radius;
          transform.velocity.x *= -1;
          transform.velocity.x *= 0.5;
        }
        if (transform.position.y > scene.height - transform.radius) {
          transform.position.y = scene.height - transform.radius;
          transform.velocity.y *= -1;
          transform.velocity.y *= 0.5;
        } else if (transform.position.y < 0 + transform.radius) {
          transform.position.y = transform.radius;
          transform.velocity.y *= -1;
          transform.velocity.y *= 0.5;
        }
      }
      for (let j = i + 1; j < ecs.getEntities().length; j++) {
        let other = ecs.getEntities()[j];
        const otherTransform = ecs.getComponent<Transform>(other, 'Transform');
        //Get distance of two particles
        let d = transform.position.dist(otherTransform.position);
        //Get if they overlap
        const overlap = transform.radius + otherTransform.radius - d;
        //If they overlap
        if (d < transform.radius + otherTransform.radius) {
          if (overlap > 0) {
            const dx = (transform.position.x - otherTransform.position.x) / d;
            const dy = (transform.position.y - otherTransform.position.y) / d;
            //Move them apart in different directions
            transform.position.x += (dx * overlap) / 2;
            transform.position.y += (dy * overlap) / 2;
            otherTransform.position.x -= (dx * overlap) / 2;
            otherTransform.position.y -= (dy * overlap) / 2;
          }
          // Now calculate new velocity after collision
          const position1 = transform.position.minus(otherTransform.position);
          const position2 = otherTransform.position.minus(transform.position);
          const velocity1 = transform.velocity.minus(otherTransform.velocity);
          const velocity2 = otherTransform.velocity.minus(transform.velocity);

          const length = position1.dotProduct(position2);

          const v1Dot = velocity1.dotProduct(position2);
          const v2Dot = velocity2.dotProduct(position1);

          let scalar1 =
            ((2 * otherTransform.mass) /
              transform.mass /
              (transform.mass + otherTransform.mass)) *
            (v1Dot / length);

          let scalar2 =
            ((2 * transform.mass) /
              transform.mass /
              (transform.mass + otherTransform.mass)) *
            (v2Dot / length);

          transform.velocity.x = transform.velocity.x - scalar1 * position1.x;
          transform.velocity.y = transform.velocity.y - scalar1 * position1.y;

          otherTransform.velocity.x =
            otherTransform.velocity.x - scalar2 * position2.x;
          otherTransform.velocity.y =
            otherTransform.velocity.y - scalar2 * position2.y;

          // let speedA = transform.velocity.mag();
          // let speedB = otherTransform.velocity.mag();
          // let kinA = 0.5 * transform.mass * speedA * speedA;
          // let kinB = 0.5 * otherTransform.mass * speedB * speedB;
          //console.log(kinA + kinB);
          // transform.velocity.times(1 - kinA);
          // otherTransform.velocity.times(1 - kinB);
        }
      }
    }
  }
}
