import { Vec } from './vec.model';
import { State } from './state.model';
import { GameObject } from './gameobject.model';

export class Smoke implements GameObject {
  pos: Vec;
  delay: number;
  isDead: boolean;
  constructor(pos: Vec, delay: number, isDead: boolean) {
    this.pos = pos;
    this.delay = delay;
    this.isDead = isDead;
  }
  create(pos: Vec): GameObject {
    return new Smoke(pos, this.delay, this.isDead);
  }

  update(state: State, time: number, keys: any) {
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
