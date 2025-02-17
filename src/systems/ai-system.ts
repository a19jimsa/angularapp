import { Transform } from 'src/components/transform';
import { Ecs } from '../core/ecs';
import { Skeleton } from 'src/components/skeleton';
import { State, States } from 'src/components/state';
import { Ai } from 'src/components/ai';

export class AiSystem {
  update(ecs: Ecs) {
    const pool = ecs.getPool<[Transform, Skeleton, State, Ai]>(
      'Transform',
      'Skeleton',
      'State',
      'Ai'
    );
    for (const [transform, skeleton, state, ai] of pool) {
      switch (state.state) {
        case States.Idle:
          break;
        case States.Running:
          break;
        case States.Attacking:
          break;
        default:
          break;
      }
    }
  }
}
