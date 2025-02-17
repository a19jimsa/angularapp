import { Attack } from 'src/components/attack';
import { Skeleton } from 'src/components/skeleton';
import { State, States } from 'src/components/state';
import { Ecs } from 'src/core/ecs';
import { ResourceManager } from 'src/core/resource-manager';

export class AttackStateSystem {
  update(ecs: Ecs) {
    const pool = ecs.getPool<[Skeleton, State, Attack]>(
      'Skeleton',
      'State',
      'Attack'
    );
    for (const [skeleton, state, attack] of pool) {
      if (state.state !== States.Attacking) {
        state.state = States.Attacking;
        skeleton.keyframes = ResourceManager.getAnimation(state);
      }
    }
  }
}
