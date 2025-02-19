import { Skeleton } from 'src/components/skeleton';
import { Ecs } from 'src/core/ecs';

export class RagdollSystem {
  update(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
      for (const bone of skeleton.bones) {
        bone.rotation =
          Math.floor(Math.random() * bone.maxAngle) + bone.minAngle;
      }
    }
  }
}
