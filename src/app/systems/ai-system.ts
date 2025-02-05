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
  timer = 0;
  update(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      const ai = ecs.getComponent<Ai>(entity, 'Ai');

      if (transform && ai) {
        switch (ai.state) {
          case 'idle':
            // if (distToPlayer < ai.detectionRadius) {
            //   ai.state = 'attack';
            //   ai.target = playerEntity;
            //   console.log('Changed to attack state');
            // }
            // if (this.timer >= 0 && this.timer <= 50) {
            //   transform.velocity.Y = 0.5;
            // } else if (this.timer > 50) {
            //   transform.velocity.Y = -0.5;
            // }
            // if (this.timer > 100) {
            //   this.timer = 0;
            // }
            // this.timer++;

            break;
          case 'chase':
            break;
          case 'attack':
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
      new HitBox(sprite.image.width, sprite.image.height)
    );
  }
}
