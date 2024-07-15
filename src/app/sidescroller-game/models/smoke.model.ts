import { Vec } from './vec.model';
import { State } from './state.model';
import { GameObject } from './gameobject.model';

export class Smoke implements GameObject {
  pos: Vec;
  delay: number;
  isDead: boolean;
  flipPlayer: boolean;
  dir: boolean;
  speed: Vec;
  gravity: number;
  size: Vec;
  constructor(pos: Vec, delay: number, isDead: boolean) {
    this.pos = pos;
    this.delay = delay;
    this.isDead = isDead;
    this.flipPlayer = true;
    this.dir = true;
    this.speed = new Vec(0, 0);
    this.gravity = 10;
    this.size = new Vec(1, 1);
  }
  static create(pos: Vec) {
    return new Smoke(pos, 10, false);
  }

  get type(): string {
    return 'smoke';
  }

  update(time: number, state: State, keys: any): GameObject {
    let pos = this.pos;
    let delay = this.delay;
    let isDead = this.isDead;

    delay += time * 5;
    if (delay > 5) {
      isDead = true;
    }

    return new Smoke(pos, delay, isDead);
  }

  collide(state: any) {
    return state;
  }
}
