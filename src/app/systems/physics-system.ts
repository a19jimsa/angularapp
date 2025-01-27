import { Falling } from '../components/falling';
import { Flying } from '../components/flying';
import { Jump } from '../components/jump';
import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../ecs';

export class PhysicsSystem {
  GRAVITY: number = 0;
  multiplyer: number = 0.05;
  update(ecs: Ecs) {
    console.log(ecs);
    for (const entity of ecs.getEntities()) {
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      const falling = ecs.getComponent<Falling>(entity, 'Falling');
      const jumping = ecs.getComponent<Jump>(entity, 'Jump');
      const flying = ecs.getComponent<Flying>(entity, 'Flying');
      const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');

      if (!transform) continue;
      if (!skeleton) continue;
      const root = skeleton.bones.find((e) => e.id === 'root');
      if (flying) continue;
      if (jumping) {
        transform.velocity.Y = -10;
        ecs.removeComponent<Jump>(entity, 'Jump');
      }
      if (falling) {
        //On ground
        if (transform.position.Y >= 350) {
          ecs.removeComponent<Falling>(entity, 'Falling');
          transform.velocity.Y = 0;
          transform.position.Y = 350;
          this.GRAVITY = 0;
        }
      } else if (!falling) {
        if (transform.velocity.Y < 0) {
          ecs.addComponent<Falling>(entity, new Falling());
        }
      }
      if (transform.velocity.Y !== 0) {
        this.GRAVITY = this.GRAVITY + this.multiplyer;
        transform.velocity.Y += this.GRAVITY;
      }
    }
  }
}
