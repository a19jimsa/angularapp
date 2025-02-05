import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../ecs';
import { Entity } from '../entity';
import { KeysPressed } from '../Systems/controller-system';
import { OnGroundState } from './on-ground-state';
import { State } from './state';

export class LoadArrowState extends State {
  frameTime = 0;
  constructor() {
    super('assets/json/loadarrow.json');
  }

  override enter(entity: Entity, ecs: Ecs): void {
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (!skeleton) return;
    skeleton.startTime = performance.now();
  }
  override exit(entity: Entity, ecs: Ecs): void {}
  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): State | null {
    if (input.up) {
      return null;
    }
    return new OnGroundState();
  }
  override update(entity: Entity, ecs: Ecs): void {}
}
