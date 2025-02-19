import { Chase } from 'src/components/chase';
import { Skeleton } from 'src/components/skeleton';
import { Target } from 'src/components/target';
import { Transform } from 'src/components/transform';
import { Ecs } from 'src/core/ecs';

export class ChaseSystem {
  update(ecs: Ecs) {
    const pool = ecs.getPool<[Transform, Skeleton, Chase, Target]>(
      'Transform',
      'Skeleton',
      'Chase',
      'Target'
    );
    for (const [transform, skeleton, chase, target] of pool) {
      const playterTransform = ecs.getComponent<Transform>(
        target.player,
        'Transform'
      );

      if (transform.position.X > playterTransform.position.X) {
        skeleton.flip = true;
        transform.velocity.X = -5;
      } else {
        skeleton.flip = false;
        transform.velocity.X = 5;
      }
    }
  }
}
