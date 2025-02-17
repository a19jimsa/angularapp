import { Player } from 'src/components/player';
import { Controlable } from '../components/controlable';
import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../core/ecs';
import { MouseHandler } from 'src/app/mouse-handler';
import { State, States } from 'src/components/state';
import { Attack } from 'src/components/attack';
import { Run } from 'src/components/run';
import { Idle } from 'src/components/idle';
import { Jump } from 'src/components/jump';

export type KeysPressed = {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  attack: boolean;
};

export class ControllerSystem {
  timer: number = 0;
  keysPressed: KeysPressed = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    attack: false,
  };

  constructor(private mouseHandler: MouseHandler) {
    console.log('Skapade controller');
    window.addEventListener('keydown', (event) => {
      if (event.code === 'KeyA') {
        this.keysPressed.left = true;
      }
      if (event.code === 'KeyD') {
        this.keysPressed.right = true;
      }
      if (event.code === 'KeyW') {
        this.keysPressed.up = true;
      }
      if (event.code === 'KeyS') {
        this.keysPressed.down = true;
      }
      if (event.code === 'Space') {
        this.keysPressed.jump = true;
      }
      if (event.code === 'Enter') {
        this.keysPressed.attack = true;
      }
    });

    window.addEventListener('keyup', (event) => {
      if (event.code === 'KeyA') {
        this.keysPressed.left = false;
      }
      if (event.code === 'KeyD') {
        this.keysPressed.right = false;
      }
      if (event.code === 'KeyW') {
        this.keysPressed.up = false;
      }
      if (event.code === 'KeyS') {
        this.keysPressed.down = false;
      }
      if (event.code === 'Space') {
        this.keysPressed.jump = false;
      }
      if (event.code === 'Enter') {
        this.keysPressed.attack = false;
      }
    });
  }

  update(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      const controlable = ecs.getComponent<Controlable>(entity, 'Controlable');
      if (controlable && transform) {
        let speedX = 0;
        let speedY = transform.velocity.Y;
        if (this.keysPressed.right) {
          speedX += 10;
          ecs.addComponent<Run>(entity, new Run());
        }
        if (this.keysPressed.left) {
          speedX += -10;
          ecs.addComponent<Run>(entity, new Run());
        }
        if (this.mouseHandler.isMouseDown) {
          ecs.addComponent<Attack>(entity, new Attack());
        }
        if (this.keysPressed.jump) {
          speedY = -10;
          ecs.addComponent<Jump>(entity, new Jump());
        }
        transform.velocity.X = speedX;
        transform.velocity.Y = speedY;
      }
    }
  }
}
