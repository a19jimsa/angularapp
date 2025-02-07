import { MouseHandler } from 'src/app/mouse-handler';
import { Camera } from 'src/components/camera';
import { Controlable } from 'src/components/controlable';
import { Skeleton } from 'src/components/skeleton';
import { Transform } from 'src/components/transform';
import { Ecs } from 'src/core/ecs';

export class AimingSystem {
  constructor(private mouseHandler: MouseHandler) {}
  update(ecs: Ecs) {
    const pool = ecs.getPool<[Transform, Skeleton, Camera]>(
      'Transform',
      'Skeleton',
      'Camera'
    );
    for (const [transform, skeleton, camera] of pool) {
      const torso = skeleton.bones.find((e) => e.id === 'torso');
      if (!torso) continue;
      const newPosition = transform.position
        .plus(torso.position)
        .minus(camera.position);
      const hypotenuse = newPosition.dist(this.mouseHandler.position);
      const adjacent = this.mouseHandler.position.X - newPosition.X;
      const angleRadians = Math.acos(Math.abs(adjacent) / hypotenuse);
      let deegrees = angleRadians * (180 / Math.PI);
      if (this.mouseHandler.position.Y < newPosition.Y) {
        deegrees *= -1;
      }

      console.log(deegrees);
      if (torso) {
        if (
          this.mouseHandler.position.X <
          transform.position.X - camera.position.X
        ) {
          torso.rotation = deegrees;
          skeleton.flip = true;
        } else {
          torso.rotation = deegrees;
          skeleton.flip = false;
        }
      }
    }
  }
}
