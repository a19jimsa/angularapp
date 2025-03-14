import { MouseHandler } from 'src/app/mouse-handler';
import { Camera } from 'src/components/camera';
import { Skeleton } from 'src/components/skeleton';
import { Transform } from 'src/components/transform';
import { Weapon } from 'src/components/weapon';
import { Ecs } from 'src/core/ecs';

export class AimingSystem {
  constructor(private mouseHandler: MouseHandler) {}
  update(ecs: Ecs) {
    const pool = ecs.getPool<[Transform, Skeleton, Camera, Weapon]>(
      'Transform',
      'Skeleton',
      'Camera',
      'Weapon'
    );
    pool.forEach(({ entity, components }) => {
      const [transform, skeleton, camera, weapon] = components;
      const torso = skeleton.bones.find(
        (e: { id: string }) => e.id === 'torso'
      );
      if (!torso) return;
      const newPosition = transform.position
        .plus(torso.position)
        .minus(camera.position);
      const hypotenuse = newPosition.dist(this.mouseHandler.position);
      const adjacent = this.mouseHandler.position.x - newPosition.x;
      const angleRadians = Math.acos(Math.abs(adjacent) / hypotenuse);
      let deegrees = (angleRadians * (180 / Math.PI)) / 2;
      if (this.mouseHandler.position.y < newPosition.y) {
        deegrees *= -1;
      }

      if (torso) {
        if (
          this.mouseHandler.position.x <
          transform.position.x - camera.position.x
        ) {
          torso.rotation = deegrees;
          skeleton.flip = true;
        } else {
          torso.rotation = deegrees;
          skeleton.flip = false;
        }
      }
    });
  }
}
