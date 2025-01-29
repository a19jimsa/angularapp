import { Foot } from '../components/foot';
import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../ecs';

export class InitializationSystem {
  update(ecs: Ecs) {
    const pool = ecs.getPool<[Foot, Transform, Skeleton]>(
      'Foot',
      'Transform',
      'Skeleton'
    );
    for (const [foot, transform, skeleton] of pool) {
      let max = 0;
      for (const bone of skeleton.bones) {
        const target = bone.position.Y;
        max = Math.max(max, target);
      }
      foot.startValue = max;
      foot.startPositionY = transform.position.Y;
      console.log(foot.startValue);
    }
  }
}
