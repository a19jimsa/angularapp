import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../ecs';
import { Entity } from '../entity';
import { KeysPressed } from '../systems/controller-system';
import { State } from './state';

export class DragonBossState extends State {
  constructor() {
    super('assets/json/dragonanimation.json');
  }
  override enter(entity: Entity, ecs: Ecs): void {}
  override exit(entity: Entity, ecs: Ecs): void {}
  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): State | null {
    return this;
  }
  override update(entity: Entity, ecs: Ecs): void {}
}
