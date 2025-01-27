import { Attack } from '../components/attack';
import { AttackDuration } from '../components/attack-duration';
import { Controlable } from '../components/controlable';
import { Jump } from '../components/jump';
import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Weapon } from '../components/weapon';
import { Ecs } from '../ecs';
import { Entity } from '../entity';
import { Vec } from '../vec';

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

  constructor() {
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
    for (let entity of ecs.getEntities()) {
      const controlable = ecs.getComponent<Controlable>(entity, 'Controlable');
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
      if (controlable && transform && skeleton) {
        let speedX = 0;
        const state = skeleton.state.handleInput(transform, this.keysPressed);
        if (state !== null) {
          skeleton.state = state;
          skeleton.state.enter(skeleton);
        }
        skeleton.state.update(skeleton);

        if (this.keysPressed.jump) {
          //IF standing on ground
          if (transform.position.Y === 350) {
            ecs.addComponent<Jump>(entity, new Jump());
          }
        }

        if (this.keysPressed.left) {
          speedX += -10;
          skeleton.flip = true;
        }

        if (this.keysPressed.right) {
          speedX += 10;
          skeleton.flip = false;
        }

        if (this.keysPressed.up) {
          if (this.timer > 100) {
            if (!skeleton.heldOffhandEntity) continue;
            const parentWeapon = ecs.getComponent<Weapon>(
              skeleton.heldOffhandEntity,
              'Weapon'
            );
            if (!parentWeapon) continue;

            if (skeleton.flip) {
              speedX = -20;
            }
            const weapon = ecs.createEntity();
            ecs.addComponent<Transform>(
              weapon,
              new Transform(
                new Vec(
                  skeleton.position.X + parentWeapon.offset.X,
                  skeleton.position.Y + parentWeapon.offset.Y
                ),
                new Vec(20, 0),
                0
              )
            );
            ecs.addComponent<Weapon>(
              weapon,
              new Weapon(null, parentWeapon.image.src, new Vec(0, 0))
            );
            this.timer = 0;
          }
          this.timer++;
        }
        transform.velocity.X = speedX;
      }
    }
  }

  createAttack(ecs: Ecs, entity: Entity) {
    console.log('Skapade attack');
    ecs.addComponent<Attack>(entity, new Attack());
    ecs.addComponent<AttackDuration>(entity, new AttackDuration(10));
  }
}
