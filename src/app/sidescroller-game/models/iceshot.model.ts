import { GameObject } from './gameobject.model';
import { State } from './state.model';
import { Vec } from './vec.model';

export class Iceshot implements GameObject {
  pos: Vec;
  speed: Vec;
  isDead: boolean;
  size = new Vec(2, 2);
  constructor(pos: Vec, speed: Vec, isDead: boolean) {
    this.pos = pos;
    this.speed = speed;
    this.isDead = isDead;
  }

  get type() {
    return 'iceshot';
  }

  create(pos: Vec) {
    return new Iceshot(pos.plus(new Vec(0, 0)), new Vec(0, 0), false);
  }

  update(time: number, state: State) {
    let xSpeed = this.speed.X;
    let ySpeed = 0;
    let pos = this.pos;
    let isDead = this.isDead;
    let movedX = pos.plus(new Vec(xSpeed * time, 0));
    if (!state.level.touches(movedX, this.size, 'wall')) {
      pos = movedX;
    } else {
      isDead = true;
    }

    let movedY = pos.plus(new Vec(0, ySpeed * time));
    if (!state.level.touches(movedY, this.size, 'wall')) {
      pos = movedY;
    } else if (ySpeed > 0) {
      ySpeed = -8;
    } else {
      ySpeed = 0;
    }

    return new Iceshot(pos, new Vec(xSpeed, ySpeed), isDead);
  }
}
