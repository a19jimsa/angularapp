import { HitBox } from '../components/hit-box';
import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../core/ecs';
import { Vec } from '../app/vec';
import { WalkBox } from 'src/components/walk-box';

export class PhysicsSystem {
  GRAVITY: number = 1.2;
  update(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      const hitBox = ecs.getComponent<HitBox>(entity, 'HitBox');
      const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
      if (!hitBox || !skeleton) continue;
      // const root = skeleton.bones.find((e) => e.id === 'root');
      // const foot = skeleton.bones.find((e) => e.id === 'right_foot');
      // if (!foot || !root) continue;
      // const dist = root.position.y + foot.position.y;
      // const newDist = skeleton.lowestPoint - dist;
      const newDist = 0;
      const pool = ecs.getPool<[Transform, WalkBox]>('Transform', 'WalkBox');
      pool.forEach(({ entity, components }) => {
        const [walkTransform, walkBox] = components;
        const movedy = transform.position.plus(
          new Vec(0, transform.velocity.y)
        );
        if (movedy.y >= walkTransform.position.y + newDist) {
          transform.velocity.y = 0;
          transform.position.y = walkTransform.position.y + newDist;
        } else {
          transform.velocity.y = transform.velocity.y + this.GRAVITY;
        }
      });
    }
  }
}
