import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../ecs';
import { Entity } from '../entity';
import { KeysPressed } from '../Systems/controller-system';
import { AttackState } from './attack-state';
import { JumpingState } from './jumping-state';
import { OnGroundState } from './on-ground-state';
import { State } from './state';

export class RunningState extends State {
  constructor() {
    super('assets/json/running.json');
  }
  override enter(entity: Entity, ecs: Ecs): void {
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (!skeleton) return;
    skeleton.startTime = performance.now();
    console.log('Running');
  }
  override exit(entity: Entity, ecs: Ecs): void {}
  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): State | null {
    let touch = 0;
    let speedX = 0;
    const transform = ecs.getComponent<Transform>(entity, 'Transform');
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (!skeleton && !transform) return null;

    if (input.attack && (input.right || input.left)) {
      skeleton.equipment = new AttackState();
      return null;
    }

    if (input.left) {
      speedX += -10;
      skeleton.flip = true;
      touch++;
    }
    if (input.right) {
      speedX += 10;
      skeleton.flip = false;
      touch++;
    }
    if (input.jump) {
      transform.velocity.X = speedX;
      return new JumpingState();
    }
    if (input.attack) {
      return new AttackState();
    }

    if (touch > 0) {
      transform.velocity.X = speedX;
      return null;
    }
    return new OnGroundState();
  }
  override update(entity: Entity, ecs: Ecs): void {}
}
