import { Ai } from 'src/components/ai';
import { Attack } from 'src/components/attack';
import { Idle } from 'src/components/idle';
import { States } from 'src/components/state';
import { Transform } from 'src/components/transform';
import { Ecs } from 'src/core/ecs';

export class AttackAiSystem {
  update(ecs: Ecs) {
    const pool = ecs.getPool<[Transform, Attack, Ai]>(
      'Transform',
      'Attack',
      'Ai'
    );
    pool.forEach(({ entity, components }) => {
      const [transform, attack, ai] = components;
      ai.state = States.Attacking;
      if (attack.timer <= 0) {
        ecs.removeComponent<Attack>(entity, 'Attack');
        ecs.addComponent<Idle>(entity, new Idle());
      }
    });
  }
}
