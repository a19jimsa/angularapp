import { Bone } from '../components/bone';
import { Falling } from '../components/falling';
import { Flying } from '../components/flying';
import { Foot } from '../components/foot';
import { HitBox } from '../components/hit-box';
import { Jump } from '../components/jump';
import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../core/ecs';
import { Vec } from '../app/vec';
import { WalkBox } from 'src/components/walk-box';
import { Hit } from 'src/components/hit';
import { Enemy } from 'src/components/enemy';
import { MathUtils } from 'src/Utils/MathUtils';
import { Player } from 'src/components/player';

export class PhysicsSystem {
  GRAVITY: number = 1.2;
  update(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
      const jumping = ecs.getComponent<Jump>(entity, 'Jump');
      const foot = ecs.getComponent<Foot>(entity, 'Foot');
      const falling = ecs.getComponent<Falling>(entity, 'Falling');
      const hitBox = ecs.getComponent<HitBox>(entity, 'HitBox');
      const hit = ecs.getComponent<Hit>(entity, 'Hit');
      const player = ecs.getComponent<Player>(entity, 'Player');
      if (!skeleton) continue;
      if (!transform) continue;
      // if (foot) {
      //   let maxPos = 0;
      //   let id = '';
      //   for (const bone of skeleton.bones) {
      //     const targetY =
      //       bone.position.Y +
      //       bone.length *
      //         Math.sin(
      //           ((bone.globalRotation +
      //             bone.rotation +
      //             bone.globalSpriteRotation) *
      //             Math.PI) /
      //             180
      //         );
      //     if (targetY > maxPos) {
      //       id = bone.id;
      //     }
      //     maxPos = Math.max(targetY, maxPos);
      //   }
      //   foot.value = foot.startValue - maxPos;
      // }

      const pool = ecs.getPool<[HitBox, WalkBox]>('HitBox', 'WalkBox');
      pool.forEach(({ entity, components }) => {
        const [hitbox, walkBox] = components;
        const movedY = transform.position.plus(
          new Vec(0, transform.velocity.Y + this.GRAVITY)
        );
        if (movedY.Y >= hitbox.position.Y) {
          transform.velocity.Y = 0;
        } else {
          transform.velocity.Y = transform.velocity.Y + this.GRAVITY;
        }
      });
    }
  }
}
