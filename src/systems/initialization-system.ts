import { ResourceManager } from 'src/core/resource-manager';
import { Foot } from '../components/foot';
import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../core/ecs';
import { MathUtils } from 'src/Utils/MathUtils';

export class InitializationSystem {
  update(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      if (!transform) {
        throw Error(
          'All entities must have transform component!\n Failed entity' + entity
        );
      }
    }

    const pool = ecs.getPool<[Transform, Skeleton]>('Transform', 'Skeleton');

    pool.forEach(({ entity, components }) => {
      const [transform, skeleton] = components;
      const root = skeleton.bones.find((e) => e.id === 'root');
      const foot = skeleton.bones.find((e) => e.id === 'right_foot');
      if (foot && root) {
        const dist = root.position.Y - foot.position.Y;
        skeleton.lowestPoint = dist;
        console.log('Längden mellan root och fott', skeleton.lowestPoint);
      }
    });
  }
}
