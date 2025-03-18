import { Target } from 'src/components/target';
import { Ecs } from '../core/ecs';
import { Transform } from 'src/components/transform';
import { Ai } from 'src/components/ai';
import { Attack } from 'src/components/attack';
import { Skeleton } from 'src/components/skeleton';
import { Weapon } from 'src/components/weapon';
import { Chase } from 'src/components/chase';
import { Idle } from 'src/components/idle';
import { Sprite } from 'src/components/sprite';

export class AiSystem {
  update(ecs: Ecs) {
    const pool = ecs.getPool<[Transform, Ai, Target]>(
      'Transform',
      'Ai',
      'Target'
    );
    pool.forEach(({ entity, components }) => {
      const [transform, ai, target] = components;
      ai.cooldown--;
      if (ai.cooldown > 0) {
        return;
      } else {
        ecs.removeComponent<Attack>(entity, 'Attack');
        ecs.removeComponent<Chase>(entity, 'Chase');
        ecs.removeComponent<Idle>(entity, 'Idle');
      }
      const playerTransform = ecs.getComponent<Transform>(
        target.player,
        'Transform'
      );
      let attackScore = 0,
        chaseScore = 0,
        idleScore = 0;
      if (!playerTransform) return;
      const dist = playerTransform.position.dist(transform.position);
      const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
      if (skeleton.heldEntity) {
        const sprite = ecs.getComponent<Sprite>(skeleton.heldEntity, 'Sprite');
        if (sprite) {
          if (sprite.image.height <= dist) {
            attackScore++;
          }
        }
      }

      //IF player is in range for attack add score
      if (dist <= ai.detectionRadius) {
        attackScore++;
      }
      if (dist <= ai.detectionRadius && dist > ai.attackRadius) {
        // if player is out of range add chase score
        chaseScore++;
      }
      if (dist >= ai.attackRadius) {
        chaseScore++;
      }
      if (dist > ai.detectionRadius) {
        console.log(dist);
        idleScore++;
      }

      if (attackScore > chaseScore && attackScore > idleScore) {
        ecs.addComponent<Attack>(entity, new Attack());
        ecs.removeComponent<Chase>(entity, 'Chase');
        ecs.removeComponent<Idle>(entity, 'Idle');
        ai.cooldown = 100;
        return;
      } else if (chaseScore > attackScore && chaseScore > idleScore) {
        ecs.addComponent<Chase>(entity, new Chase());
        ecs.removeComponent<Attack>(entity, 'Attack');
        ecs.removeComponent<Idle>(entity, 'Idle');
        ai.cooldown = 50;
        return;
      } else {
        //Add new pathfinding
        ecs.addComponent<Idle>(entity, new Idle());
        ecs.removeComponent<Chase>(entity, 'Chase');
        ecs.removeComponent<Attack>(entity, 'Attack');
        ai.cooldown = 50;
        return;
      }
    });
  }
}
