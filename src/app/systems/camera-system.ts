import { Camera } from '../components/camera';
import { Transform } from '../components/transform';
import { Ecs } from '../ecs';

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
        if (transform.position.X > canvasWidth / 2) {
          camera.position.X = transform.position.X - canvasWidth / 2;
        }
        if (transform.position.Y > canvasHeight / 2) {
          camera.position.Y = transform.position.Y - canvasHeight / 2;
        }
        if (camera.position.X + canvasWidth > width) {
          camera.position.X = width - canvasWidth;
        }
        if (camera.position.Y + canvasWidth > height) {
          camera.position.Y = height - canvasHeight;
        }
      }
    }
  }
}
