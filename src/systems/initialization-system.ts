import { ResourceManager } from 'src/core/resource-manager';
import { Foot } from '../components/foot';
import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../core/ecs';

export class InitializationSystem {
  update(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
      if (!transform) {
        throw Error(
          'All entities must have transform component!\n Failed entity' + entity
        );
      }
      if (!skeleton) continue;
      skeleton.state.enter(entity, ecs);
    }

    const pool = ecs.getPool<[Foot, Transform, Skeleton]>(
      'Foot',
      'Transform',
      'Skeleton'
    );

    for (const [foot, transform, skeleton] of pool) {
      const root = skeleton.bones.find((e) => e.id === 'root');
      let max = 0;
      for (const bone of skeleton.bones) {
        const target = bone.position.Y;
        max = Math.max(max, target);
      }
      foot.startValue = max;
      foot.startPositionY = transform.position.Y;
      foot.value;
    }
  }
}
