import { Camera } from '../components/camera';
import { Transform } from '../components/transform';
import { Ecs } from '../core/ecs';

export class CameraSystem {
  update(
    ecs: Ecs,
    canvasWidth: number,
    canvasHeight: number,
    width: number,
    height: number
  ) {
    for (let entity of ecs.getEntities()) {
      const camera = ecs.getComponent<Camera>(entity, 'Camera');
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      if (camera && transform) {
        if (transform.position.x > canvasWidth / 2) {
          camera.position.x = transform.position.x - canvasWidth / 2;
        }
        if (transform.position.y > canvasHeight / 2) {
          camera.position.y = transform.position.y - canvasHeight / 2;
        }
        if (camera.position.x + canvasWidth > width) {
          camera.position.x = width - canvasWidth;
        }
        if (camera.position.y + canvasWidth > height) {
          camera.position.y = height - canvasHeight;
        }
      }
    }
  }
}
