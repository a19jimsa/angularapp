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
    }
  }
}
