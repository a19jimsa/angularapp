import { Controlable } from '../components/controlable';
import { Transform } from '../components/transform';
import { Ecs } from '../ecs';
import { MouseHandler } from '../mouse-handler';
import { Vec } from '../vec';

export class ControlSystem {
  startVec: Vec = new Vec(0, 0);
  update(ecs: Ecs, mouseHandler: MouseHandler) {
    if (mouseHandler.isMouseDown) {
      for (let entity of ecs.getEntities()) {
        const input = ecs.getComponent<Controlable>(entity, 'Controlable');
        if (input !== undefined) {
          console.log('mouse down');
          this.startVec = mouseHandler.getMousePosition();
          console.log(this.startVec);
        }
      }
    }
    if (mouseHandler.isMouseUp) {
      for (let entity of ecs.getEntities()) {
        const input = ecs.getComponent<Controlable>(entity, 'Controlable');
        const transform = ecs.getComponent<Transform>(entity, 'Transform');
        if (input !== undefined) {
          console.log('mouse up');
          const endVec = mouseHandler.position;
          const newVelocity = endVec.minus(this.startVec);
          newVelocity.times(0.1);
          console.log(this.startVec);
          console.log(endVec);
          console.log(newVelocity);
          transform.velocity = newVelocity;
        }
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

    mouseHandler.isMouseDown = false;
    mouseHandler.isMouseUp = false;
  }
}
