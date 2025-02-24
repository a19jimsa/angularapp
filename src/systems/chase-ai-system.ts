import { Ai } from 'src/components/ai';
import { Attack } from 'src/components/attack';
import { Chase } from 'src/components/chase';
import { Idle } from 'src/components/idle';
import { Skeleton } from 'src/components/skeleton';
import { States } from 'src/components/state';
import { Target } from 'src/components/target';
import { Transform } from 'src/components/transform';
import { Ecs } from 'src/core/ecs';

export class ChaseAISystem {
  update(ecs: Ecs) {
    const pool = ecs.getPool<[Transform, Ai, Skeleton, Chase, Target]>(
      'Transform',
      'Ai',
      'Skeleton',
      'Chase',
      'Target'
    );
    pool.forEach(({ entity, components }) => {
      const [transform, ai, skeleton, chase, target] = components;
      const playerTransform = ecs.getComponent<Transform>(
        target.player,
        'Transform'
      );

      if (
        playerTransform.position.dist(transform.position) <= ai.attackRadius
      ) {
        ecs.addComponent<Attack>(entity, new Attack());
        ecs.removeComponent<Chase>(entity, 'Chase');
        ecs.removeComponent<Idle>(entity, 'Idle');
        return;
      }
      if (
        playerTransform.position.dist(transform.position) >= ai.detectionRadius
      ) {
        ecs.addComponent<Idle>(entity, new Idle());
        ecs.removeComponent<Chase>(entity, 'Chase');
        return;
      }
      if (transform.position.X > playerTransform.position.X) {
        skeleton.flip = true;
        transform.velocity.X = -5;
      } else {
        skeleton.flip = false;
        transform.velocity.X = 5;
      }
      console.log('I am in chase system' + entity);
      ai.state = States.Running;
    });
  }
}
