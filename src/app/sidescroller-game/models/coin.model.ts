import { GameObject } from './gameobject.model';
import { State } from './state.model';
import { Vec } from './vec.model';

export class Coin implements GameObject {
  wobbleSpeed = 8;
  wobbleDist = 0.07;
  basePos: Vec;
  wobble: number;
  pos: Vec;
  gravity: number;
  flipPlayer: boolean;
  size: Vec;
  speed: Vec;
  dir: boolean;
  isDead: boolean;
  constructor(pos: Vec, basePos: Vec, wobble: number) {
    this.pos = pos;
    this.basePos = basePos;
    this.wobble = wobble;
    this.gravity = 1;
    this.flipPlayer = true;
    this.size = new Vec(1, 1);
    this.speed = new Vec(1, 1);
    this.dir = true;
    this.isDead = false;
  }

  get type() {
    return 'coin';
  }

  static create(pos: Vec): Coin {
    let basePos = pos.plus(new Vec(0.2, 0.1));
    return new Coin(basePos, basePos, Math.random() * Math.PI * 2);
  }

  collide(state: State): State {
    console.log('hit coin');
    let filtered = state.actors.filter((a) => a.type !== 'coin');
    let status = state.status;
    if (!filtered.some((a: { type: string }) => a.type === 'coin'))
      status = 'won';
    return new State(state.level, filtered, status);
  }

  update(time: number, state: State, keys: any): Coin {
    let wobble = this.wobble + time * this.wobbleSpeed;
    let wobblePos = Math.sin(wobble) * this.wobbleDist;
    return new Coin(
      this.basePos.plus(new Vec(0, wobblePos)),
      this.basePos,
      wobble
    );
  }
}
