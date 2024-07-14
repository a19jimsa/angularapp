import { State } from './state.model';
import { Vec } from './vec.model';

export class Block {
  pos: Vec;
  speed: Vec;
  reset: Vec | undefined;
  constructor(pos: Vec, speed: Vec, reset?: Vec) {
    this.pos = pos;
    this.speed = speed;
    this.reset = reset;
  }

  get type() {
    return 'block';
  }

  static create(pos: Vec) {
    return new Block(pos, new Vec(3, 0));
  }
  size = new Vec(1, 1);
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
