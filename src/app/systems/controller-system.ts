import { Controlable } from '../components/controlable';
import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../ecs';

export class ControllerSystem {
  keysPressed = { left: false, right: false, up: false, down: false };

  constructor() {
    console.log('Skapade controller');
    window.addEventListener('keydown', (event) => {
      switch (event.code) {
        case 'KeyA':
          this.keysPressed.left = true;
          break;
        case 'KeyD':
          this.keysPressed.right = true;
          break;
        case 'KeyW':
          this.keysPressed.up = true;
          break;
        case 'KeyS':
          this.keysPressed.down = true;
          break;
      }
    });

    window.addEventListener('keyup', (event) => {
      switch (event.code) {
        case 'KeyA':
          this.keysPressed.left = false;
          break;
        case 'KeyD':
          this.keysPressed.right = false;
          break;
        case 'KeyW':
          this.keysPressed.up = false;
          break;
        case 'KeyS':
          this.keysPressed.down = false;
          break;
      }
    });
  }

  update(ecs: Ecs) {
    for (let entity of ecs.getEntities()) {
      const controlable = ecs.getComponent<Controlable>(entity, 'Controlable');
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
      if (controlable !== undefined && skeleton !== undefined) {
        if (this.keysPressed.right) {
          skeleton.stateMachine.changeState('running');
          transform.velocity.X = 5;
        } else if (this.keysPressed.left) {
          skeleton.stateMachine.changeState('running');
          transform.velocity.X = -5;
        } else {
          skeleton.stateMachine.changeState('idle');
          transform.velocity.X = 0;
        }
      }
    }
  }
}
