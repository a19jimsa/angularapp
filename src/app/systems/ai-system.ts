import { Skeleton } from '../components/skeleton';
import { Ai } from '../components/ai';
import { Transform } from '../components/transform';
import { Ecs } from '../ecs';
import { Entity } from '../entity';
import { Projectile } from '../components/projectile';
import { AttackDuration } from '../components/attack-duration';
import { Vec } from '../vec';
import { Sprite } from '../components/sprite';
import { Rotation } from '../components/rotation';
import { HitBox } from '../components/hit-box';

export class AiSystem {
  update(ecs: Ecs, playerEntity: Entity) {
    for (const entity of ecs.getEntities()) {
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      const ai = ecs.getComponent<Ai>(entity, 'Ai');
      const playerTransform = ecs.getComponent<Transform>(
        playerEntity,
        'Transform'
      );
      if (transform && ai) {
        const distToPlayer = transform.position.dist(playerTransform.position);
        switch (ai.state) {
          case 'idle':
            if (distToPlayer < ai.detectionRadius) {
              ai.state = 'attack';
              ai.target = playerEntity;
              console.log('Changed to attack state');
            }
            break;
          case 'chase':
            break;
          case 'attack':
            if (distToPlayer > ai.detectionRadius) {
              ai.target = null;
              ai.state = 'idle';
              console.log('Changed to idle state');
            }
            ai.cooldown -= 0.16;
            if (ai.cooldown > 0) break;
            this.createAttack(ecs, entity);
            ai.cooldown = 5;
            break;
          case 'patrol':
            break;
        }
      }
    }
  }

  createAttack(ecs: Ecs, aiEntity: Entity) {
    const aiSkeleton = ecs.getComponent<Skeleton>(aiEntity, 'Skeleton');
    if (!aiSkeleton) return;
    const aiBone = aiSkeleton.bones.find((e) => e.id === 'dragonJaw');
    if (!aiBone) return;
    const attack = ecs.createEntity();
    ecs.addComponent<Transform>(
      attack,
      new Transform(aiBone.position, new Vec(10, 0), 10)
    );
    ecs.addComponent<Projectile>(attack, new Projectile());

    ecs.addComponent<AttackDuration>(attack, new AttackDuration(100));
    const sprite = new Sprite('assets/sprites/wep_ax039.png');
    ecs.addComponent<Sprite>(attack, sprite);
    ecs.addComponent<Rotation>(attack, new Rotation());
    ecs.addComponent<HitBox>(
      attack,
      new HitBox(aiBone.position, sprite.image.width, sprite.image.height)
    );
  }
}
