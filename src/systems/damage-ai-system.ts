import { Ai } from 'src/components/ai';
import { Chase } from 'src/components/chase';
import { Damage } from 'src/components/damage';
import { Idle } from 'src/components/idle';
import { States } from 'src/components/state';
import { Transform } from 'src/components/transform';
import { Ecs } from 'src/core/ecs';

export class DamageAiSystem {
  update(ecs: Ecs) {
    const pool = ecs.getPool<[Transform, Ai, Damage]>(
      'Transform',
      'Ai',
      'Damage'
    );
    pool.forEach(({ entity, components }) => {
      const [transform, ai, damage] = components;
      ai.cooldown -= 0.16;
      if (ai.cooldown <= 0) {
        ecs.addComponent<Idle>(entity, new Idle());
        ecs.addComponent<Chase>(entity, new Chase());
        ecs.removeComponent<Damage>(entity, 'Damage');
        ai.cooldown = 2;
      }
      transform.velocity.X = 0;
      console.log('I am in damage system');
      ai.state = States.Damage;
    });
  }
}
