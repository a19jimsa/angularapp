import { Ai } from 'src/components/ai';
import { Attack } from 'src/components/attack';
import { AttackCooldown } from 'src/components/attack-cooldown';
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
      if (transform.position.x > playerTransform.position.x) {
        skeleton.flip = false;
        transform.velocity.x = 5;
      } else {
        skeleton.flip = true;
        transform.velocity.x = -5;
      }
      ai.state = States.Running;
    });
  }
}
