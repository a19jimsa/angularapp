import { Target } from 'src/components/target';
import { Ecs } from '../core/ecs';
import { Transform } from 'src/components/transform';
import { Ai } from 'src/components/ai';

export class AiSystem {
  update(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
    }
  }
}
