import { Patrol } from 'src/components/patrol';
import { Target } from 'src/components/target';
import { Transform } from 'src/components/transform';
import { Ecs } from 'src/core/ecs';

export class PatrolSystem {
  update(ecs: Ecs) {
    const pool = ecs.getPool<[Transform, Patrol, Target]>(
      'Transform',
      'Patrol',
      'Target'
    );
  }
}
