import { Attack } from '../components/attack';
import { Controlable } from '../components/controlable';
import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Weapon } from '../components/weapon';
import { Ecs } from '../ecs';
import { Vec } from '../vec';

export class ControllerSystem {
  keysPressed = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    attack: false,
  };

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
        case 'Space':
          this.keysPressed.jump = true;
          break;
        case 'Enter':
          this.keysPressed.attack = true;
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
        case 'Enter':
          this.keysPressed.attack = false;
          break;
      }
    });
  }

  update(ecs: Ecs) {
    for (let entity of ecs.getEntities()) {
      const controlable = ecs.getComponent<Controlable>(entity, 'Controlable');
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
      if (controlable !== undefined) {
        let speedX = 0;
        let speedY = 0;
        if (this.keysPressed.left) {
          skeleton.stateMachine.currentState = 'running';
          skeleton.stateMachine.changeState();
          skeleton.flip = true;
          speedX += -10;
        }
        if (this.keysPressed.right) {
          skeleton.stateMachine.currentState = 'running';
          skeleton.stateMachine.changeState();
          skeleton.flip = false;
          speedX += 10;
        }
        if (this.keysPressed.jump) {
          //speedY -= 10;
        }
        if (this.keysPressed.attack) {
          speedX = 0;
          skeleton.frames = 0;
          skeleton.stateMachine.currentState = 'attack';
          skeleton.stateMachine.changeState();
        }
        transform.velocity.X = speedX;
        transform.velocity.Y = speedY;
      }
    }
  }
}
