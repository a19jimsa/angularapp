import { Camera } from '../components/camera';
import { Transform } from '../components/transform';
import { Ecs } from '../ecs';
import { Scene } from '../scene';

export class CameraSystem {
  update(ecs: Ecs, scene: Scene) {
    for (let entity of ecs.getEntities()) {
      const camera = ecs.getComponent<Camera>(entity, 'Camera');
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      if (camera !== undefined && transform !== undefined) {
        if (transform.position.X > scene.canvasWidth / 2) {
          camera.position.X = transform.position.X - scene.canvasWidth / 2;
        }
        if (transform.position.Y > scene.canvasHeight / 2) {
          camera.position.Y = transform.position.Y - scene.canvasHeight / 2;
        }

        if (camera.position.X + scene.canvasWidth > scene.width) {
          camera.position.X = scene.width - scene.canvasWidth;
        }
        if (camera.position.Y + scene.canvasWidth > scene.height) {
          camera.position.Y = scene.height - scene.canvasHeight;
        }
      }
    }
  }
}
