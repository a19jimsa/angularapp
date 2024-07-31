import { Transform } from '../components/transform';
import { Ecs } from '../ecs';
import { Scene } from '../scene';

export class CollisionSystem {
  update(ecs: Ecs, scene: Scene, friction: number): void {
    for (let i = 0; i < ecs.getEntities().length; i++) {
      let entity = ecs.getEntities()[i];
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      if (transform !== undefined) {
        transform.velocity.times(0.995);
        if (transform.velocity.mag() < 2) {
          transform.velocity.times(0.95);
        }

        if (transform.position.X > scene.width - transform.radius) {
          transform.position.X = scene.width - transform.radius;
          transform.velocity.X *= -1;
          transform.velocity.X *= 0.5;
        } else if (transform.position.X < 0 + transform.radius) {
          transform.position.X = transform.radius;
          transform.velocity.X *= -1;
          transform.velocity.X *= 0.5;
        }
        if (transform.position.Y > scene.height - transform.radius) {
          transform.position.Y = scene.height - transform.radius;
          transform.velocity.Y *= -1;
          transform.velocity.Y *= 0.5;
        } else if (transform.position.Y < 0 + transform.radius) {
          transform.position.Y = transform.radius;
          transform.velocity.Y *= -1;
          transform.velocity.Y *= 0.5;
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
          //Remove speed on hit
          transform.velocity.times(friction);
          otherTransform.velocity.times(friction);
          if (overlap > 0) {
            const dx = (transform.position.X - otherTransform.position.X) / d;
            const dy = (transform.position.Y - otherTransform.position.Y) / d;
            //Move them apart in different directions
            transform.position.X += (dx * overlap) / 2;
            transform.position.Y += (dy * overlap) / 2;
            otherTransform.position.X -= (dx * overlap) / 2;
            otherTransform.position.Y -= (dy * overlap) / 2;
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

          transform.velocity.X = transform.velocity.X - scalar1 * position1.X;
          transform.velocity.Y = transform.velocity.Y - scalar1 * position1.Y;

          otherTransform.velocity.X =
            otherTransform.velocity.X - scalar2 * position2.X;
          otherTransform.velocity.Y =
            otherTransform.velocity.Y - scalar2 * position2.Y;

          let speedA = transform.velocity.mag();
          let speedB = otherTransform.velocity.mag();
          let kinA = 0.5 * transform.mass * speedA * speedA;
          let kinB = 0.5 * otherTransform.mass * speedB * speedB;
          //console.log(kinA + kinB);
          // transform.velocity.times(1 - kinA);
          // otherTransform.velocity.times(1 - kinB);
        }
      }
    }
  }
}
