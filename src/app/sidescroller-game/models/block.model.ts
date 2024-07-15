import { GameObject } from './gameobject.model';
import { State } from './state.model';
import { Vec } from './vec.model';

export class Block implements GameObject {
  pos: Vec;
  speed: Vec;
  reset: Vec | undefined;
  flipPlayer: boolean;
  dir: boolean;
  gravity: number;
  size: Vec;
  isDead: boolean;
  constructor(pos: Vec, speed: Vec, reset?: Vec) {
    this.pos = pos;
    this.speed = speed;
    this.reset = reset;
    this.dir = true;
    this.flipPlayer = true;
    this.gravity = 10;
    this.size = new Vec(1, 1);
    this.isDead = false;
  }

  get type() {
    return 'wall';
  }

  static create(pos: Vec): GameObject {
    return new Block(pos, new Vec(3, 0), new Vec(1, 1));
  }
  collide(state: State): State {
    return new State(state.level, state.actors, state.status);
  }
  update(time: number, state: State): Block {
    let newPos = this.pos.plus(this.speed.times(time));
    if (!state.level.touches(newPos, this.size, 'wall')) {
      return new Block(newPos, this.speed, this.reset);
    } else if (this.reset) {
      return new Block(this.reset, this.speed, this.reset);
    } else {
      return new Block(this.pos, this.speed.times(-1));
    }
  }
}
