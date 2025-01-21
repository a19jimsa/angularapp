import { Falling } from '../components/falling';
import { Jump } from '../components/jump';
import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../ecs';

export class PhysicsSystem {
  GRAVITY: number = 0;
  multiplyer: number = 0.05;
  update(ecs: Ecs) {
    const pool = ecs.getPool<[Skeleton, Transform]>('Skeleton', 'Transform');
    for (const [skeleton, transform] of pool) {
      let max = 0;
      for (const bone of skeleton.bones) {
        if (bone.position.Y > max) {
          max = bone.position.Y;
        }
      }
      const root = skeleton.bones.find((e) => e.id === 'root');
      if (root) {
        let startPosY = transform.position.Y;
        root.position.Y = 350 + startPosY - max;
      }
    }
    for (const entity of ecs.getEntities()) {
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      const falling = ecs.getComponent<Falling>(entity, 'Falling');
      const jumping = ecs.getComponent<Jump>(entity, 'Jump');
      if (!transform) return;
      if (jumping) {
        transform.velocity.Y = -10;
        ecs.removeComponent<Jump>(entity, 'Jump');
      }
      if (transform.velocity.Y < 0) {
        ecs.addComponent<Falling>(entity, new Falling());
      }
      if (falling) {
        //On ground
        if (transform.position.Y >= 350) {
          ecs.removeComponent<Falling>(entity, 'Falling');
          transform.velocity.Y = 0;
          transform.position.Y = 350;
          this.GRAVITY = 0;
        }
      }
      if (transform.velocity.Y !== 0) {
        this.GRAVITY = this.GRAVITY + this.multiplyer;
        transform.velocity.Y += this.GRAVITY;
      }
    }
  }
}
