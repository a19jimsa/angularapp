import { Transform } from '../components/transform';
import { Ecs } from '../ecs';

export class MovementSystem {
  update(ecs: Ecs) {
    const pool = ecs.getPool<[Transform]>('Transform');

    for (let [transform] of pool) {
      // transform.velocity.times(0.995);
      // if (transform.velocity.mag() < 2) {
      //   transform.velocity.times(0.94);
      // }
      console.log(transform);
      transform.position.X += transform.velocity.X;
      transform.position.Y += transform.velocity.Y;
    }
  }
}
