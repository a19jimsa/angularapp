import { Ai } from 'src/components/ai';
import { Skeleton } from 'src/components/skeleton';
import { States } from 'src/components/state';
import { Ecs } from 'src/core/ecs';
import { ResourceManager } from 'src/core/resource-manager';
import { MathUtils } from 'src/Utils/MathUtils';

export class StateSystem {
  update(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
      const ai = ecs.getComponent<Ai>(entity, 'Ai');
      if (!skeleton || !ai) continue;
      if (!skeleton.blend) {
        if (skeleton.elapsedTime >= skeleton.animationDuration) {
          this.changeAnimation(skeleton, ai.state);
        }
      }
    }
  }

  changeAnimation(skeleton: Skeleton, state: States) {
    MathUtils.createSnaphot(skeleton);
    skeleton.keyframes = ResourceManager.getAnimation(skeleton.resource, state);
  }
}
