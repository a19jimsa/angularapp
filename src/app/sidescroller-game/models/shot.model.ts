import { GameObject } from './gameobject.model';
import { Player } from './player.model';
import { State } from './state.model';
import { Vec } from './vec.model';

export class Shot {
  isDead = false;
  size = new Vec(1, 1);
  pos: Vec;
  speed: Vec;
  constructor(pos: Vec, speed: Vec, isDead: boolean) {
    this.pos = pos;
    this.speed = speed;
    this.isDead = isDead;
  }

  get type() {
    return 'shot';
  }

  static create(pos: Vec) {
    return new Shot(pos.plus(new Vec(0, 0)), new Vec(0, 0), false);
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

    let boss = state.boss;
    console.log('bajhskorv');
    return new Shot(pos, new Vec(xSpeed, ySpeed), isDead);
  }

  collide(state: State) {
    let filtered = state.actors.filter(
      (a: { isDead: boolean }) => a.isDead !== true
    );
    return new State(state.level, filtered, 'playing');
  }

  overlap(actor1: Player, actor2: Player) {
    return (
      actor1.pos.X + actor1.size.X > actor2.pos.X &&
      actor1.pos.X < actor2.pos.X + actor2.size.X &&
      actor1.pos.Y + actor1.size.Y > actor2.pos.Y &&
      actor1.pos.Y < actor2.pos.Y + actor2.size.Y
    );
  }
}
