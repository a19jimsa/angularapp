import { GameObject } from './gameobject.model';
import { State } from './state.model';
import { Vec } from './vec.model';

export class Lava implements GameObject {
  size = new Vec(1, 1);
  pos: Vec;
  speed: Vec;
  reset: Vec | undefined;
  gravity: number;
  flipPlayer: boolean;
  dir: boolean;
  isDead: boolean;
  constructor(pos: Vec, speed: Vec, reset?: Vec) {
    this.pos = pos;
    this.speed = speed;
    this.reset = reset;
    this.dir = true;
    this.flipPlayer = true;
    this.gravity = 10;
    this.isDead = false;
  }

  get type() {
    return 'lava';
  }

  static create(pos: Vec) {
    var ch = '=';
    if (ch === '=') {
      return new Lava(pos, new Vec(2, 0));
    } else if (ch === '|') {
      return new Lava(pos, new Vec(0, 2));
    } else if (ch === 'v') {
      return new Lava(pos, new Vec(0, 3), pos);
    }
    return new Lava(pos, new Vec(2, 0));
  }

  collide(state: State) {
    return new State(state.level, state.actors, 'lost');
  }

  update(time: number, state: State): Lava {
    let newPos = this.pos.plus(this.speed.times(time));
    if (!state.level.touches(newPos, this.size, 'wall')) {
      return new Lava(newPos, this.speed, this.reset);
    } else if (this.reset) {
      return new Lava(this.reset, this.speed, this.reset);
    } else {
      return new Lava(this.pos, this.speed.times(-1));
    }
  }
}
