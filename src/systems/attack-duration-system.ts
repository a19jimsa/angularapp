import { Attack } from '../components/attack';
import { AttackDuration } from '../components/attack-duration';
import { Projectile } from '../components/projectile';
import { Ecs } from '../core/ecs';

export class AttackDurationSystem {
  update(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const attackDuration = ecs.getComponent<AttackDuration>(
        entity,
        'AttackDuration'
      );
      const projectile = ecs.getComponent<Projectile>(entity, 'Projectile');
      if (attackDuration && !projectile) {
        attackDuration.cooldown -= 0.16;
        if (attackDuration.cooldown <= 0) {
          ecs.removeComponent<Attack>(entity, 'Attack');
          ecs.removeComponent<AttackDuration>(entity, 'AttackDuration');
          console.log('Tog bort attackkomponenter');
        }
      }
      if (projectile) {
        attackDuration.cooldown -= 0.16;
      }
    }
  }
}
