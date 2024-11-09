import { AttackDuration } from '../components/attack-duration';
import { Projectile } from '../components/projectile';
import { Ecs } from '../ecs';

export class ProjectileSystem {
  update(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const projectile = ecs.getComponent<Projectile>(entity, 'Projectile');
      const attackDuration = ecs.getComponent<AttackDuration>(
        entity,
        'AttackDuration'
      );
      if (projectile && attackDuration) {
        if (attackDuration.duration <= 0) {
          ecs.removeEntity(entity);
        }
      }
    }
  }
}
