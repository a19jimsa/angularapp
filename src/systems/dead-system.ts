import { Health } from '../components/health';
import { Ecs } from '../core/ecs';

export class DeadSystem {
  update(ecs: Ecs) {
    for (let entity of ecs.getEntities()) {
      const health = ecs.getComponent<Health>(entity, 'Health');
      if (health !== undefined) {
        if (health.health <= 0) {
          ecs.removeEntity(entity);
          break;
        }
      }
    }
  }
}
