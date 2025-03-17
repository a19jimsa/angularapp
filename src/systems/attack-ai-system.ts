import { Ai } from 'src/components/ai';
import { Attack } from 'src/components/attack';
import { Skeleton } from 'src/components/skeleton';
import { Target } from 'src/components/target';
import { Transform } from 'src/components/transform';
import { Ecs } from 'src/core/ecs';

export class AttackAiSystem {
  update(ecs: Ecs) {
    const pool = ecs.getPool<[Transform, Attack, Ai, Target]>(
      'Transform',
      'Attack',
      'Ai',
      'Target'
    );
    pool.forEach(({ entity, components }) => {
      const [transform, attack, ai, target] = components;
    });
  }

  moveCloser(skeleton: Skeleton, ai: Transform, player: Transform) {
    if (ai.position.x > player.position.x) {
      skeleton.flip = true;
      ai.velocity.x = -5;
    } else {
      skeleton.flip = false;
      ai.velocity.x = 5;
    }
  }

  moveAway(skeleton: Skeleton, ai: Transform, player: Transform) {
    if (ai.position.x < player.position.x) {
      skeleton.flip = false;
      ai.velocity.x = -5;
    } else {
      skeleton.flip = true;
      ai.velocity.x = 5;
    }
  }
}
