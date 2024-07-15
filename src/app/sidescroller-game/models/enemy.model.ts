import { GameObject } from './gameobject.model';
import { State } from './state.model';
import { Vec } from './vec.model';

export class Enemy implements GameObject {
  pos: Vec;
  gravity: number = 10;
  dir: boolean;
  flipPlayer: boolean;
  speed: Vec;
  size: Vec;
  isDead: boolean;
  constructor(
    pos: Vec,
    size: Vec,
    speed: Vec,
    flipPlayer: boolean,
    dir: boolean
  ) {
    this.pos = pos;
    this.speed = speed;
    this.flipPlayer = flipPlayer;
    this.dir = dir;
    this.size = size;
    this.isDead = false;
  }

  get type() {
    return 'enemy';
  }

  static create(pos: Vec) {
    return new Enemy(pos, new Vec(0.5, 1.5), new Vec(0, 0), false, true);
  }

  collide(state: State) {
    let player = state.player;
    if (player == undefined) {
      return new State(state.level, state.actors, 'lost');
    }

    if (player.pos.Y + player.size.Y < this.pos.Y + 0.5) {
      let filtered = state.actors.filter((a) => a.type === 'enemy');
      return new State(state.level, filtered, state.status);
    } else {
      return new State(state.level, state.actors, 'lost');
    }
  }

  update(time: number, state: State, keys: any) {
    let xSpeed = 0;
    let player = state.player;
    let pos = this.pos;
    let dir = this.dir;
    let jumping = false;
    let enemySpeed = 5;
    let jumpSpeed = 5;
    let gravity = 2;

    if (!dir) {
      xSpeed = -enemySpeed;
      this.flipPlayer = true;
    } else {
      xSpeed = enemySpeed;
      this.flipPlayer = false;
    }

    let movedX = pos.plus(new Vec(xSpeed * time, 0));
    if (!state.level.touches(movedX, this.size, 'wall')) {
      pos = movedX;
    } else {
      movedX = new Vec(0, 0);
      this.flipPlayer = !this.flipPlayer;
    }

    let movedXY = pos.plus(new Vec(xSpeed * time * 5, 2));
    if (!state.level.touches(movedXY, this.size, 'wall')) {
      jumping = true;
    }

    let ySpeed = this.speed.Y + time * gravity;
    let movedY = pos.plus(new Vec(0, ySpeed * time));

    if (!state.level.touches(movedY, this.size, 'wall')) {
      pos = movedY;
    } else if (ySpeed > 0 && jumping) {
      ySpeed = -jumpSpeed;
    } else {
      ySpeed = 0;
    }

    return new Enemy(
      pos,
      this.size,
      new Vec(xSpeed, ySpeed),
      this.flipPlayer,
      dir
    );
  }
}
