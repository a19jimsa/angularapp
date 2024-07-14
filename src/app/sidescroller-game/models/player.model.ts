import { GameObject } from './gameobject.model';
import { State } from './state.model';
import { Vec } from './vec.model';

export class Player {
  public pos: Vec;
  public slide: boolean;
  public gravity: number = 30;
  public dir: boolean;
  public flipPlayer: boolean;
  public speed: Vec;
  enemySpeed = 5;
  life: number = 5;
  bossColor: number = 10;
  delay: number = 10;
  size = new Vec(0.5, 5);
  constructor(
    pos: Vec,
    speed: Vec,
    flipPlayer: boolean,
    slide: boolean,
    gravity: number
  ) {
    this.pos = pos;
    this.speed = speed;
    this.dir = false;
    this.slide = slide;
    this.gravity = gravity;
    this.flipPlayer = flipPlayer;
  }
  get type() {
    return 'player';
  }

  static create(pos: Vec): Player {
    return new Player(pos, new Vec(0, 0), true, false, 30);
  }

  update(time: number, state: State, keys: any): Player {
    var delay = 2;
    let xSpeed = 0;
    let pos = this.pos;
    const playerXSpeed = 10;
    const gravity = 30;
    const jumpSpeed = 10;
    const walljumpSpeed = 10;
    if (keys.ArrowLeft) {
      xSpeed -= playerXSpeed;
      this.flipPlayer = true;
    }
    if (keys.ArrowRight) {
      xSpeed += playerXSpeed;
      this.flipPlayer = false;
    }
    if (keys.ArrowDown) {
      xSpeed += playerXSpeed;
      this.slide = true;
      delay = 0.5;
    }

    let ySpeed = this.speed.Y + time * gravity;
    let movedX = pos.plus(new Vec(xSpeed * time, 0));
    if (!state.level.touches(movedX, this.size, 'wall')) {
      pos = movedX;
    } else if (keys.ArrowUp && ySpeed > 1) {
      ySpeed = -jumpSpeed;
      delay = 0.2;
      if (this.flipPlayer) {
        xSpeed = walljumpSpeed;
        this.flipPlayer = false;
      } else {
        xSpeed = -walljumpSpeed;
        this.flipPlayer = true;
      }
    } else if (keys.ArrowLeft && ySpeed > 1) {
      ySpeed = 1;
      this.flipPlayer = false;
    } else if (keys.ArrowRight && ySpeed > 1) {
      ySpeed = 1;
      this.flipPlayer = true;
    }

    let movedY = pos.plus(new Vec(0, ySpeed * time));
    if (!state.level.touches(movedY, this.size, 'wall')) {
      pos = movedY;
    } else if (keys.ArrowUp && ySpeed > 0) {
      ySpeed = -jumpSpeed;
    } else {
      ySpeed = 0;
    }

    let blocks = state.actors.filter(
      (a: { type: string }) => a.type == 'block'
    );
    let newPos = pos.plus(new Vec(xSpeed * time, 0));
    let tempPlayer = new Player(
      newPos,
      new Vec(xSpeed, ySpeed),
      this.flipPlayer,
      this.slide,
      this.gravity
    );

    for (let block of blocks) {
      if (!this.overlap(block, tempPlayer)) {
      } else {
        pos = pos.plus(new Vec(block.speed.x * time - xSpeed * time, 0));
        console.log('x');
      }
      let movedBlockY = pos.plus(new Vec(0, ySpeed * time));

      let tempPlayery = new Player(
        movedBlockY,
        new Vec(xSpeed, ySpeed),
        this.flipPlayer,
        this.slide,
        this.gravity
      );

      if (!this.overlap(block, tempPlayery)) {
      } else if (keys.ArrowUp && ySpeed > 0) {
        ySpeed = -jumpSpeed;
      } else {
        console.log('y');
        pos = pos.plus(new Vec(block.speed.x * time, -ySpeed * time));
        ySpeed = 0;
      }
    }

    return new Player(
      pos,
      new Vec(xSpeed, ySpeed),
      this.flipPlayer,
      this.slide,
      this.gravity
    );
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
