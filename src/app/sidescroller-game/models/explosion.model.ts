import { Vec } from './vec.model';
import { State } from './state.model';
import { GameObject } from './gameobject.model';

export class Explosion {
  pos: Vec;
  delay: number;
  isDead: boolean;
  size: Vec;
  constructor(pos: any, delay: number, isDead: boolean, size: Vec) {
    this.pos = pos;
    this.delay = delay;
    this.isDead = isDead;
    this.size = size;
  }

  get type() {
    return 'explosion';
  }

  static create(pos: Vec) {
    return new Explosion(pos.plus(new Vec(0, 0)), 5, false, new Vec(2.5, 2.2));
  }

  update(time: number, state: State, keys: any) {
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
