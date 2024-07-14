import { GameObject } from './gameobject.model';
import { State } from './state.model';
import { Vec } from './vec.model';

export class Coin {
  size = new Vec(0.6, 0.6);
  wobbleSpeed = 8;
  wobbleDist = 0.07;
  pos: Vec;
  basePos: Vec;
  wobble: number;
  constructor(pos: Vec, basePos: Vec, wobble: number) {
    this.pos = pos;
    this.basePos = basePos;
    this.wobble = wobble;
  }

  get type() {
    return 'coin';
  }

  static create(pos: Vec) {
    let basePos = pos.plus(new Vec(0.2, 0.1));
    return new Coin(basePos, basePos, Math.random() * Math.PI * 2);
  }

  collide(state: State): State {
    let filtered = state.actors.filter((a: this) => a !== this);
    let status = state.status;
    if (!filtered.some((a: { type: string }) => a.type === 'coin'))
      status = 'won';
    return new State(state.level, filtered, status);
  }

  update(time: number): Coin {
    let wobble = this.wobble + time * this.wobbleSpeed;
    let wobblePos = Math.sin(wobble) * this.wobbleDist;
    return new Coin(
      this.basePos.plus(new Vec(0, wobblePos)),
      this.basePos,
      wobble
    );
  }
}
