import { Ai } from '../components/ai';
import { Attack } from '../components/attack';
import { AttackDuration } from '../components/attack-duration';
import { Damage } from '../components/damage';
import { Enemy } from '../components/enemy';
import { HitBox } from '../components/hit-box';
import { Player } from '../components/player';
import { Projectile } from '../components/projectile';
import { Transform } from '../components/transform';
import { Weapon } from '../components/weapon';
import { Ecs } from '../ecs';
import { Entity } from '../entity';
import { Vec } from '../vec';

export class AiSystem {
  update(ecs: Ecs, playerEntity: Entity) {
    for (const entity of ecs.getEntities()) {
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      const ai = ecs.getComponent<Ai>(entity, 'Ai');
      const weapon = ecs.getComponent<Weapon>(entity, 'Weapon');
      const playerTransform = ecs.getComponent<Transform>(
        playerEntity,
        'Transform'
      );
      if (transform && ai && weapon) {
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
            const enemyProjectile = ecs.createEntity();
            ecs.addComponent<Transform>(
              enemyProjectile,
              new Transform(weapon.position, new Vec(10, 0), 10)
            );
            ecs.addComponent<HitBox>(
              enemyProjectile,
              new HitBox(weapon.position, 50, 50)
            );
            ecs.addComponent<Attack>(enemyProjectile, new Attack());
            ecs.addComponent<Damage>(enemyProjectile, new Damage(100));
            ecs.addComponent<AttackDuration>(
              enemyProjectile,
              new AttackDuration(10)
            );
            ecs.addComponent<Projectile>(enemyProjectile, new Projectile());
            ecs.addComponent<Enemy>(enemyProjectile, new Enemy());
            ai.cooldown = 10;
            break;
          case 'patrol':
            break;
        }
      }
    }
  }
}
