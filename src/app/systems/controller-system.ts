import { Attack } from '../components/attack';
import { AttackDuration } from '../components/attack-duration';
import { Controlable } from '../components/controlable';
import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../ecs';
import { Entity } from '../entity';

export type KeysPressed = {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  attack: boolean;
};

export class ControllerSystem {
  active = false;
  keysPressed: KeysPressed = {
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
          this.active = false;
          break;
        case 'KeyD':
          this.keysPressed.right = false;
          this.active = false;
          break;
        case 'KeyW':
          this.keysPressed.up = false;
          this.active = false;
          break;
        case 'KeyS':
          this.keysPressed.down = false;
          this.active = false;
          break;
        case 'Enter':
          this.keysPressed.attack = false;
          this.active = false;
          break;
        case 'Space':
          this.keysPressed.jump = false;
          this.active = false;
          break;
      }
    });
  }

  update(ecs: Ecs) {
    for (let entity of ecs.getEntities()) {
      const controlable = ecs.getComponent<Controlable>(entity, 'Controlable');
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
      if (controlable && transform && skeleton) {
        let speedX = 0;
        let speedY = 0;

        skeleton.state = skeleton.state.handleInput(this.keysPressed, skeleton);
        skeleton.state.update();

        if (transform.velocity.X == 0) {
          skeleton.startTime = performance.now();
        }

        if (this.keysPressed.left) {
          speedX += -10;
          skeleton.flip = true;
        }

        if (this.keysPressed.right) {
          speedX += 10;
          skeleton.flip = false;
        }

        transform.velocity.X = speedX;
        transform.velocity.Y = speedY;
      }
    }
  }

  createAttack(ecs: Ecs, entity: Entity) {
    console.log('Skapade attack');
    ecs.addComponent<Attack>(entity, new Attack());
    ecs.addComponent<AttackDuration>(entity, new AttackDuration(10));
  }
}
