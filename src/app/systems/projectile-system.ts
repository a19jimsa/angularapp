import { AttackDuration } from '../components/attack-duration';
import { Projectile } from '../components/projectile';
import { Rotation } from '../components/rotation';
import { Sprite } from '../components/sprite';
import { Transform } from '../components/transform';
import { Ecs } from '../ecs';
import { Renderer } from '../renderer';

export class ProjectileSystem {
  update(ecs: Ecs, renderer: Renderer) {
    for (const entity of ecs.getEntities()) {
      const projectile = ecs.getComponent<Projectile>(entity, 'Projectile');
      const attackDuration = ecs.getComponent<AttackDuration>(
        entity,
        'AttackDuration'
      );
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      const sprite = ecs.getComponent<Sprite>(entity, 'Sprite');
      const rotation = ecs.getComponent<Rotation>(entity, 'Rotation');
      if (projectile && attackDuration && sprite && transform && rotation) {
        rotation.angle += 10;
        //renderer.drawWeapon(sprite, transform, rotation.angle);
        if (attackDuration.cooldown <= 0) {
          ecs.removeEntity(entity);
        }
      }
    }
  }
}
