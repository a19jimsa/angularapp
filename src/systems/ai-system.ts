import { Target } from 'src/components/target';
import { Ecs } from '../core/ecs';
import { Transform } from 'src/components/transform';
import { Idle } from 'src/components/idle';
import { Attack } from 'src/components/attack';
import { Chase } from 'src/components/chase';
import { Patrol } from 'src/components/patrol';
import { Ai } from 'src/components/ai';
import { Run } from 'src/components/run';

export class AiSystem {
  update(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      const target = ecs.getComponent<Target>(entity, 'Target');
      const ai = ecs.getComponent<Ai>(entity, 'Ai');
      if (!target) continue;
      const playerTransform = ecs.getComponent<Transform>(
        target.player,
        'Transform'
      );
      if (transform && target && ai && playerTransform) {
        if (
          transform.position.dist(playerTransform.position) < ai.detectionRadius
        ) {
          ai.state = 'Chase';
        }
        if (
          transform.position.dist(playerTransform.position) < ai.attackRadius
        ) {
          ai.state = 'Attack';
        }
        if (
          transform.position.dist(playerTransform.position) > ai.detectionRadius
        ) {
          ai.state = 'Idle';
        }
        switch (ai.state) {
          case 'Idle':
            console.log('Ai is idle');
            ecs.addComponent<Idle>(entity, new Idle());
            ecs.removeComponent<Patrol>(entity, 'Patrol');
            ecs.removeComponent<Attack>(entity, 'Attack');
            ecs.removeComponent<Chase>(entity, 'Chase');
            ecs.removeComponent<Run>(entity, 'Run');
            break;
          case 'Patrol':
            console.log('Ai is patroling');
            ecs.addComponent<Patrol>(entity, new Patrol());
            ecs.addComponent<Run>(entity, new Run());
            ecs.removeComponent<Idle>(entity, 'Idle');
            ecs.removeComponent<Attack>(entity, 'Attack');
            ecs.removeComponent<Chase>(entity, 'Chase');
            break;
          case 'Chase':
            console.log('Ai is chasing');
            ecs.addComponent<Chase>(entity, new Chase());
            ecs.addComponent<Run>(entity, new Run());
            ecs.removeComponent<Idle>(entity, 'Idle');
            ecs.removeComponent<Attack>(entity, 'Attack');
            ecs.removeComponent<Patrol>(entity, 'Patrol');
            break;
          case 'Attack':
            console.log('Ai is attacking');
            ecs.addComponent<Attack>(entity, new Attack());
            ecs.removeComponent<Idle>(entity, 'Idle');
            ecs.removeComponent<Patrol>(entity, 'Patrol');
            ecs.removeComponent<Chase>(entity, 'Chase');
            ecs.removeComponent<Run>(entity, 'Run');
            break;
        }
      }
    }
  }
}
