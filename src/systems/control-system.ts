import { Controlable } from '../components/controlable';
import { Rotation } from '../components/rotation';
import { Transform } from '../components/transform';
import { Ecs } from '../core/ecs';
import { MouseHandler } from '../app/mouse-handler';

export class ControlSystem {
  update(ecs: Ecs, mouseHandler: MouseHandler) {
    for (let entity of ecs.getEntities()) {
      const rotation = ecs.getComponent<Rotation>(entity, 'Rotation');
      if (mouseHandler.isMouseDown) {
        if (rotation) {
          rotation.speed = mouseHandler.scrollValue * 0.1;
        }
      }
      if (mouseHandler.isMouseUp) {
        console.log(mouseHandler.isUpPosition);
        const input = ecs.getComponent<Controlable>(entity, 'Controlable');
        const transform = ecs.getComponent<Transform>(entity, 'Transform');
        if (input && transform) {
          const newVelocity = mouseHandler.isUpPosition.minus(
            mouseHandler.isDownPosition
          );
          const newSpeed = newVelocity.times(0.1);
          transform.velocity = newSpeed;
        }
        mouseHandler.isMouseUp = false;
      }
    }
  }
}
