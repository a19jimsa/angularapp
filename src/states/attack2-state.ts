import { Skeleton } from '../components/skeleton';
import { Ecs } from '../core/ecs';
import { Entity } from '../app/entity';
import { KeysPressed } from '../systems/controller-system';
import { OnGroundState } from './on-ground-state';
import { State } from './state';
import { ResourceManager } from 'src/core/resource-manager';

export class Attack2State extends State {
  frameTimer = 0;
  override enter(entity: Entity, ecs: Ecs): void {
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (skeleton) {
      skeleton.startTime = performance.now();
      skeleton.state.keyframes = ResourceManager.getAnimation('attack2');
    }
  }
  override exit(entity: Entity, ecs: Ecs): void {
    throw new Error('Method not implemented.');
  }
  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): State | null {
    if (this.frameTimer > 60) {
      return new OnGroundState();
    }
    return null;
  }
  override update(entity: Entity, ecs: Ecs): void {
    this.frameTimer++;
  }
}
