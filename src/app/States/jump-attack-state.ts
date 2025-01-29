import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../ecs';
import { Entity } from '../entity';
import { KeysPressed } from '../systems/controller-system';
import { OnGroundState } from './on-ground-state';
import { State } from './state';

export class JumpAttackState extends State {
  frameTime = 0;
  constructor() {
    super('assets/json/jumpattack.json');
  }

  override enter(entity: Entity, ecs: Ecs): void {
    console.log('Jump attack');
  }
  override exit(entity: Entity, ecs: Ecs): void {}
  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): State | null {
    if (this.frameTime >= 80) {
      return new OnGroundState();
    }
    return null;
  }
  override update(entity: Entity, ecs: Ecs): void {
    const transform = ecs.getComponent<Transform>(entity, 'Transform');
    if (transform.position.Y === 350) {
      transform.velocity.X = 0;
    }
    this.frameTime++;
  }
}
