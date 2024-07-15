import { Vec } from './vec.model';
import { State } from './state.model';
import { GameObject } from './gameobject.model';

export class Explosion implements GameObject {
  pos: Vec;
  delay: number;
  isDead: boolean;
  size: Vec;
  flipPlayer: boolean;
  speed: Vec;
  dir: boolean;
  gravity: number;
  constructor(pos: any, delay: number, isDead: boolean, size: Vec) {
    this.pos = pos;
    this.delay = delay;
    this.isDead = isDead;
    this.size = size;
    this.flipPlayer = true;
    this.speed = new Vec(1, 1);
    this.dir = true;
    this.gravity = 10;
  }

  get type() {
    return 'explosion';
  }

  static create(pos: Vec) {
    return new Explosion(pos.plus(new Vec(0, 0)), 5, false, new Vec(2.5, 2.2));
  }

  update(time: number, state: State, keys: any): GameObject {
    this.delay += time * 10;
    if (this.delay > 8) {
      this.isDead = true;
    }
    let pos = this.pos;
    return new Explosion(pos, this.delay, this.isDead, new Vec(2.5, 2.2));
  }

  collide(state: State) {
    let filtered = state.actors.filter(
      (a: { isDead: boolean }) => a.isDead !== true
    );
    return new State(state.level, filtered, state.status);
  }
}
