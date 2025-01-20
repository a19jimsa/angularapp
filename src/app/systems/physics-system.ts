import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../ecs';

export class PhysicsSystem {
  update(ecs: Ecs) {
    const pool = ecs.getPool<[Skeleton, Transform]>('Skeleton', 'Transform');
    for (const [skeleton, transform] of pool) {
      let max = 0;

      for (const bone of skeleton.bones) {
        if (bone.position.Y > max) {
          max = bone.position.Y;
        }
      }
      const root = skeleton.bones.find((e) => e.id === 'root');
      if (root) {
        let startPosY = transform.position.Y;
        root.position.Y = 400 + startPosY - max;
      }
    }
  }
}
