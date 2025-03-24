import { Player } from 'src/components/player';
import { Controlable } from '../components/controlable';
import { Transform } from '../components/transform';
import { Ecs } from '../core/ecs';
import { MouseHandler } from 'src/app/mouse-handler';
import { Inventory } from 'src/components/inventory';

export type KeysPressed = {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  attack: boolean;
  roll: boolean;
  inventory: boolean;
};

export class ControllerSystem {
  timer: number = 0;
  isPressed = new Set<any>();
  wasPressed = new Set<any>();

  keysPressed: KeysPressed = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    attack: false,
    roll: false,
    inventory: false,
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
      if (event.code === 'KeyR') {
        this.keysPressed.roll = true;
      }
      if (event.code === 'KeyI') {
        console.log(this.isPressed);
        this.isPressed.add(event.code);
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
      if (event.code === 'KeyR') {
        this.keysPressed.roll = false;
      }
      if (event.code === 'KeyI') {
        this.isPressed.delete(event.code);
        this.wasPressed.delete(event.code);
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
      const inventory = ecs.getComponent<Inventory>(entity, 'Inventory');
      if (inventory) {
        if (this.isPressed.has('KeyI') && !this.wasPressed.has('KeyI')) {
          console.log(this.keysPressed.inventory);
          inventory.show = !inventory.show;
          this.wasPressed.add('KeyI');
        }
      }
    }
  }
}
