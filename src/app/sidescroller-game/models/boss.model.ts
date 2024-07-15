import { Explosion } from './explosion.model';
import { GameObject } from './gameobject.model';
import { Player } from './player.model';
import { Shot } from './shot.model';
import { State } from './state.model';
import { Vec } from './vec.model';

export class Boss implements GameObject {
  pos: Vec;
  size: Vec;
  speed: any;
  flipPlayer: any;
  dir: any;
  life: any;
  explosion: any;
  bossColor: any;
  name: any;
  static flipPlayer: any;
  static dir: any;
  enemySpeed = 5;
  gravity: number = 10;
  isDead: boolean;
  constructor(
    pos: Vec,
    size: Vec,
    speed: Vec,
    flipPlayer: any,
    dir: any,
    life: number,
    explosion: number,
    bossColor: number,
    name: string
  ) {
    this.pos = pos;
    this.size = size;
    this.speed = speed;
    this.flipPlayer = flipPlayer;
    this.dir = dir;
    this.life = life;
    this.explosion = explosion;
    this.bossColor = bossColor;
    this.name = name;
    this.isDead = false;
  }

  get type() {
    return 'boss';
  }

  static create(pos: Vec) {
    {
      return new Boss(
        pos,
        new Vec(3, 0),
        new Vec(0, 0),
        this.flipPlayer,
        this.dir,
        10,
        0,
        1,
        'Megaman'
      );
    }
  }

  collide(state: { level: any; actors: any; status: any }) {
    return new State(state.level, state.actors, state.status);
  }

  explode(state: { actors: any[]; level: any; status: any }) {
    if (this.explosion % 5 === 0) {
      state.actors.push(
        new Explosion(
          new Vec(
            this.pos.X + Math.floor(Math.random() * 5) - 2,
            this.pos.Y + Math.floor(Math.random() * 5) - 2
          ),
          0,
          false,
          new Vec(2.5, 2.2)
        )
      );
    } else if (this.explosion > 200) {
      let filtered = state.actors.filter((a: this) => a !== this);
      return new State(state.level, filtered, 'won');
    }
    return new State(state.level, state.actors, state.status);
  }

  update(time: number, state: State, keys: any): Boss {
    let xSpeed = 0;
    let player = state.player;
    let pos = this.pos;
    let dir = this.dir;
    let jumping = false;
    let flipPlayer = this.flipPlayer;
    let life = this.life;
    let explosion = this.explosion;
    let bossColor = this.bossColor;
    let jumpSpeed = 10;

    if (life > 0) {
      if (!dir) {
        xSpeed = -this.enemySpeed;
        flipPlayer = true;
      } else {
        xSpeed = this.enemySpeed;
        flipPlayer = false;
      }
    } else {
      explosion++;
    }

    let movedX = pos.plus(new Vec(xSpeed * time, 0));
    if (!state.level.touches(movedX, this.size, 'wall')) {
      pos = movedX;
    } else {
      movedX = new Vec(0, 0);
      flipPlayer = !flipPlayer;
    }

    let movedXY = pos.plus(new Vec(xSpeed * time * 5, 2));
    if (!state.level.touches(movedXY, this.size, 'wall')) {
      jumping = true;
    }

    let ySpeed = this.speed.y + time * this.gravity;
    let movedY = pos.plus(new Vec(0, ySpeed * time));

    if (!state.level.touches(movedY, this.size, 'wall')) {
      pos = movedY;
    } else if (ySpeed > 0 && jumping) {
      ySpeed = -jumpSpeed;
    } else {
      ySpeed = 0;
    }

    let shots = state.actors.filter((a): a is Shot => a.type === 'shot');
    for (let shot of shots) {
      if (this.overlap(shot, this)) {
        life--;
      }
    }
    return new Boss(
      pos,
      new Vec(3, 0),
      new Vec(xSpeed, ySpeed),
      flipPlayer,
      dir,
      life,
      explosion,
      bossColor,
      this.name
    );
  }
  overlap(actor1: Shot, actor2: Boss) {
    return (
      actor1.pos.X + actor1.size.X > actor2.pos.X &&
      actor1.pos.X < actor2.pos.X + actor2.size.X &&
      actor1.pos.Y + actor1.size.Y > actor2.pos.Y &&
      actor1.pos.Y < actor2.pos.Y + actor2.size.Y
    );
  }
}
