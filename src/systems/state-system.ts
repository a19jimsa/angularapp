import { Ai } from 'src/components/ai';
import { Player } from 'src/components/player';
import { Skeleton } from 'src/components/skeleton';
import { State, States } from 'src/components/state';
import { Ecs } from 'src/core/ecs';
import { ResourceManager } from 'src/core/resource-manager';

export class StateSystem {
  update(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
      const ai = ecs.getComponent<Ai>(entity, 'Ai');
      if (!skeleton || !ai) continue;
      this.changeAnimation(skeleton, ai.state);
    }
  }
  changeAnimation(skeleton: Skeleton, state: States) {
    skeleton.keyframes = ResourceManager.getAnimation(skeleton, state);
  }
}
