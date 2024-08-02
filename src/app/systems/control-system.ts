import { Controlable } from '../components/controlable';
import { Rotation } from '../components/rotation';
import { Transform } from '../components/transform';
import { Ecs } from '../ecs';
import { MouseHandler } from '../mouse-handler';

export class ControlSystem {
  update(ecs: Ecs, mouseHandler: MouseHandler) {
    for (let entity of ecs.getEntities()) {
      const rotation = ecs.getComponent<Rotation>(entity, 'Rotation');
      if (mouseHandler.isMouseDown) {
        if (rotation !== undefined) {
          rotation.rotation += mouseHandler.scrollValue / 1000;
        }
      } else if (mouseHandler.isMouseUp) {
        console.log(mouseHandler.isUpPosition);
        const input = ecs.getComponent<Controlable>(entity, 'Controlable');
        const transform = ecs.getComponent<Transform>(entity, 'Transform');
        if (input !== undefined && transform !== undefined) {
          const newVelocity = mouseHandler.isUpPosition.minus(
            mouseHandler.isDownPosition
          );
          newVelocity.times(0.1);
          transform.velocity = newVelocity;
          mouseHandler.scrollValue = 0;
        }
        mouseHandler.isMouseUp = false;
      }
    }
  }
}
