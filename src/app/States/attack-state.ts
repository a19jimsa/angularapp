import { HitBox } from '../components/hit-box';
import { Skeleton } from '../components/skeleton';
import { Smear } from '../components/smear';
import { Transform } from '../components/transform';
import { Weapon } from '../components/weapon';
import { Ecs } from '../ecs';
import { Entity } from '../entity';
import { KeysPressed } from '../Systems/controller-system';
import { Vec } from '../vec';
import { Attack2State } from './attack2-state';
import { OnGroundState } from './on-ground-state';
import { State } from './state';

export class AttackState extends State {
  frameTimer = 0;
  constructor() {
    super('assets/json/attack.json');
  }
  override enter(entity: Entity, ecs: Ecs): void {
    console.log('Attack');
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    const transform = ecs.getComponent<Transform>(entity, 'Transform');

    if (skeleton) {
      skeleton.startTime = performance.now();
    }
    if (transform) {
      transform.velocity.X = 0;
    }
    if (skeleton.heldEntity) {
      const smear = ecs.getComponent<Smear>(skeleton.heldEntity, 'Smear');
      const weapon = ecs.getComponent<Weapon>(skeleton.heldEntity, 'Weapon');
      if (smear) {
        smear.startPosition = transform.position;
        smear.positions = [];
      }
    }
  }
  override exit(entity: Entity, ecs: Ecs): void {}
  override handleInput(
    entity: Entity,
    ecs: Ecs,
    input: KeysPressed
  ): State | null {
    if (this.frameTimer > 30 && input.attack) {
      return new Attack2State();
    } else if (this.frameTimer > 30) {
      return new OnGroundState();
    }
    return null;
  }
  override update(entity: Entity, ecs: Ecs): void {
    const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
    if (skeleton && skeleton.heldEntity) {
      const hitBox = ecs.getComponent<HitBox>(skeleton.heldEntity, 'HitBox');
      const smear = ecs.getComponent<Smear>(skeleton.heldEntity, 'Smear');
    }
    this.frameTimer++;
  }
}
