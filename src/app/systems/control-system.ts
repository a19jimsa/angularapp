import { Controlable } from '../components/controlable';
import { Transform } from '../components/transform';
import { Ecs } from '../ecs';
import { MouseHandler } from '../mouse-handler';

export class ControlSystem {
  update(ecs: Ecs, mouseHandler: MouseHandler) {
    if (mouseHandler.isMouseDown) {
      console.log(mouseHandler.isDownPosition);
      mouseHandler.isMouseDown = false;
    } else if (mouseHandler.isMouseUp) {
      console.log(mouseHandler.isUpPosition);
      for (let entity of ecs.getEntities()) {
        const input = ecs.getComponent<Controlable>(entity, 'Controlable');
        const transform = ecs.getComponent<Transform>(entity, 'Transform');
        if (input !== undefined && transform !== undefined) {
          const newVelocity = mouseHandler.isUpPosition.minus(
            mouseHandler.isDownPosition
          );
          newVelocity.times(0.1);
          transform.velocity = newVelocity;
        }
      }
      mouseHandler.isMouseUp = false;
    }

    // scene.canvas.nativeElement.addEventListener('mousedown', (event) => {
    //   for (let entity of ecs.getEntities()) {
    //     const input = ecs.getComponent<Controlable>(entity, 'Controlable');
    //     if (input !== undefined) {
    //       console.log('mouse down');
    //       const rect = scene.canvas.nativeElement.getBoundingClientRect();
    //       cursorX = event.x - rect.left;
    //       cursorY = event.y - rect.top;
    //       console.log(cursorX, cursorY);
    //     }
    //   }
    // });
    // scene.canvas.nativeElement.addEventListener('mouseup', (event) => {
    //   for (let entity of ecs.getEntities()) {
    //     const input = ecs.getComponent<Controlable>(entity, 'Controlable');
    //     const transform = ecs.getComponent<Transform>(entity, 'Transform');
    //     if (input !== undefined) {
    //       console.log('mouse up');
    //       const rect = scene.canvas.nativeElement.getBoundingClientRect();
    //       const startVec = new Vec(cursorX, cursorY);
    //       const endVec = new Vec(event.x - rect.left, event.y - rect.top);
    //       const newVelocity = endVec.minus(startVec);
    //       newVelocity.times(0.1);
    //       console.log(newVelocity);
    //       transform.velocity = newVelocity;
    //     }
    //   }
    // });
  }
}
