import { Falling } from '../components/falling';
import { Flying } from '../components/flying';
import { Foot } from '../components/foot';
import { Jump } from '../components/jump';
import { Skeleton } from '../components/skeleton';
import { Standing } from '../components/standing';
import { Transform } from '../components/transform';
import { Ecs } from '../ecs';

export class PhysicsSystem {
  GRAVITY: number = 0.5;
  update(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      const falling = ecs.getComponent<Falling>(entity, 'Falling');
      const jumping = ecs.getComponent<Jump>(entity, 'Jump');
      const flying = ecs.getComponent<Flying>(entity, 'Flying');
      const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
      const foot = ecs.getComponent<Foot>(entity, 'Foot');

      if (flying) continue;
      if (!skeleton) continue;
      const root = skeleton.bones.find((e) => e.id === 'root');
      if (!transform) continue;
      if (root) {
        if (!foot) continue;
        let maxBone = 0;
        // Beräkna den absoluta positionen för varje ben
        for (const bone of skeleton.bones) {
          const y =
            bone.position.Y +
            bone.length *
              Math.sin((bone.rotation + bone.globalRotation * Math.PI) / 180);
          maxBone = Math.max(y, maxBone);
        }
        root.position.Y += foot.value - maxBone;
        console.log(root.position.Y);
      }
      if (transform.velocity.Y > 0) {
      }
      if (transform.velocity.Y < 0) {
        ecs.removeComponent<Jump>(entity, 'Jump');
        ecs.addComponent<Falling>(entity, new Falling());
      }
      if (transform.position.Y >= 350) {
        transform.velocity.Y = 0;
        transform.position.Y = 350;
        ecs.removeComponent<Falling>(entity, 'Falling');
        ecs.removeComponent<Jump>(entity, 'Jump');
        continue;
      }
      if (falling || jumping) transform.velocity.Y += this.GRAVITY;
    }
  }
}
