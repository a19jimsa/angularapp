import { Ai } from 'src/components/ai';
import { Attack } from 'src/components/attack';
import { AttackCooldown } from 'src/components/attack-cooldown';
import { AttackDuration } from 'src/components/attack-duration';
import { Skeleton } from 'src/components/skeleton';
import { States } from 'src/components/state';
import { Target } from 'src/components/target';
import { Transform } from 'src/components/transform';
import { Weapon } from 'src/components/weapon';
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
      const attackDuration = ecs.getComponent<AttackDuration>(
        entity,
        'AttackDuration'
      );
      const playerTransform = ecs.getComponent<Transform>(
        target.player,
        'Transform'
      );
      const attackCooldown = ecs.getComponent<AttackCooldown>(
        entity,
        'AttackCooldown'
      );
      const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
      transform.velocity.X = 0;
      //Do not do anything while attacking
      if (attackDuration) {
        ai.state = States.Attacking;
        transform.velocity.X = 0;
        attackDuration.cooldown--;
        if (attackDuration.cooldown <= 0) {
          ecs.removeComponent<AttackDuration>(entity, 'AttackDuration');
        }
        return;
      } else {
        ai.state = States.Idle;
      }

      if (skeleton) {
        if (skeleton.heldEntity) {
          const weapon = ecs.getComponent<Weapon>(
            skeleton.heldEntity,
            'Weapon'
          );
          if (weapon) {
            const dist = transform.position.dist(playerTransform.position);
            if (dist >= weapon.image.height) {
              this.moveCloser(skeleton, transform, playerTransform);
              ai.state = States.Running;
            } else if (!attackCooldown) {
              ecs.addComponent<AttackDuration>(entity, new AttackDuration(30));
              ecs.addComponent<AttackCooldown>(entity, new AttackCooldown(60));
            }
          }
        }
      }
      if (attackCooldown) {
        attackCooldown.timer--;
        if (attackCooldown.timer <= 0) {
          ecs.removeComponent<AttackCooldown>(entity, 'AttackCooldown');
        }
        this.moveAway(skeleton, transform, playerTransform);
      }
    });
  }

  moveCloser(skeleton: Skeleton, ai: Transform, player: Transform) {
    if (ai.position.X > player.position.X) {
      skeleton.flip = true;
      ai.velocity.X = -5;
    } else {
      skeleton.flip = false;
      ai.velocity.X = 5;
    }
  }

  moveAway(skeleton: Skeleton, ai: Transform, player: Transform) {
    if (ai.position.X < player.position.X) {
      skeleton.flip = false;
      ai.velocity.X = -5;
    } else {
      skeleton.flip = true;
      ai.velocity.X = 5;
    }
  }
}
