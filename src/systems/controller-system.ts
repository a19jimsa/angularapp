import { Player } from 'src/components/player';
import { Controlable } from '../components/controlable';
import { Transform } from '../components/transform';
import { Ecs } from '../core/ecs';
import { MouseHandler } from 'src/app/mouse-handler';

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
    if (this.mouseHandler.isMouseDown) {
      this.keysPressed.attack = true;
    } else if (this.mouseHandler.isMouseUp) {
      this.keysPressed.attack = false;
    }
    for (const entity of ecs.getEntities()) {
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      const controlable = ecs.getComponent<Controlable>(entity, 'Controlable');
      const player = ecs.getComponent<Player>(entity, 'Player');
      if (controlable && transform && player) {
        const state = player.state.handleInput(entity, ecs, this.keysPressed);
        if (state !== null) {
          player.state.exit(entity, ecs);
          player.state = state;
          player.state.enter(entity, ecs);
        }
        player.state.update(entity, ecs);
      }
    }
  }
}
