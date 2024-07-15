import { GameObject } from './gameobject.model';
import { State } from './state.model';
import { Vec } from './vec.model';

export class Player implements GameObject {
  pos: Vec;
  gravity: number = 30;
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
    gravity: number
  ) {
    this.pos = pos;
    this.speed = speed;
    this.dir = false;
    this.gravity = gravity;
    this.flipPlayer = flipPlayer;
    this.isDead = false;
    this.size = size;
  }
  get type(): string {
    return 'player';
  }

  static create(pos: Vec): Player {
    return new Player(pos, new Vec(0.5, 1.5), new Vec(0, 0), true, 30);
  }

  collide(state: State): State {
    return new State(state.level, state.actors, 'lost');
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
      this.size,
      new Vec(xSpeed, ySpeed),
      this.flipPlayer,
      this.gravity
    );

    // for (let block of blocks) {
    //   if (!this.overlap(block, tempPlayer)) {
    //   } else {
    //     pos = pos.plus(new Vec(block.speed.x * time - xSpeed * time, 0));
    //     console.log('x');
    //   }
    //   let movedBlockY = pos.plus(new Vec(0, ySpeed * time));

    //   let tempPlayery = new Player(
    //     movedBlockY,
    //     new Vec(xSpeed, ySpeed),
    //     this.flipPlayer,
    //     this.slide,
    //     this.gravity
    //   );

    //   if (!this.overlap(block, tempPlayery)) {
    //   } else if (keys.ArrowUp && ySpeed > 0) {
    //     ySpeed = -jumpSpeed;
    //   } else {
    //     console.log('y');
    //     pos = pos.plus(new Vec(block.speed.x * time, -ySpeed * time));
    //     ySpeed = 0;
    //   }
    // }

    return new Player(
      pos,
      this.size,
      new Vec(xSpeed, ySpeed),
      this.flipPlayer,
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
