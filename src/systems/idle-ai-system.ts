import { Ai } from 'src/components/ai';
import { Chase } from 'src/components/chase';
import { Idle } from 'src/components/idle';
import { States } from 'src/components/state';
import { Target } from 'src/components/target';
import { Transform } from 'src/components/transform';
import { Ecs } from 'src/core/ecs';

export class IdleAiSystem {
  update(ecs: Ecs) {
    const pool = ecs.getPool<[Transform, Ai, Target, Idle]>(
      'Transform',
      'Ai',
      'Target',
      'Idle'
    );
    pool.forEach(({ entity, components }) => {
      const [transform, ai, target, idle] = components;
      const targetTransform = ecs.getComponent<Transform>(
        target.player,
        'Transform'
      );
      transform.velocity.X = 0;
      ai.state = States.Idle;
    });
  }
}
