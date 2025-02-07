import { Attack } from '../components/attack';
import { AttackDuration } from '../components/attack-duration';
import { Controlable } from '../components/controlable';
import { Jump } from '../components/jump';
import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Weapon } from '../components/weapon';
import { Ecs } from '../core/ecs';
import { Entity } from '../app/entity';
import { Vec } from '../app/vec';
import { MouseHandler } from 'src/app/mouse-handler';
import { AttackState } from 'src/states/attack-state';

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
      const controlable = ecs.getComponent<Controlable>(entity, 'Controlable');
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
      if (controlable && transform && skeleton) {
        if (this.mouseHandler.isMouseDown) {
          this.keysPressed.attack = true;
        } else if (this.mouseHandler.isMouseUp) {
          this.keysPressed.attack = false;
        }
        const state = skeleton.state.handleInput(entity, ecs, this.keysPressed);
        if (state !== null) {
          skeleton.state = state;
          skeleton.state.enter(entity, ecs);
        }
        skeleton.state.update(entity, ecs);

        if (this.keysPressed.up) {
          if (this.timer > 100) {
            if (!skeleton.heldOffhandEntity) return;
            const parentWeapon = ecs.getComponent<Weapon>(
              skeleton.heldOffhandEntity,
              'Weapon'
            );
            if (!parentWeapon) return;
            const weapon = ecs.createEntity();
            ecs.addComponent<Transform>(
              weapon,
              new Transform(
                new Vec(transform.position.X, transform.position.Y),
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
      }
    }
  }

  createAttack(ecs: Ecs, entity: Entity) {
    console.log('Skapade attack');
    ecs.addComponent<Attack>(entity, new Attack());
    ecs.addComponent<AttackDuration>(entity, new AttackDuration(10));
    console.log(ecs);
  }
}
