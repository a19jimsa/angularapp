import { ElementRef } from '@angular/core';
import { Level } from './level.model';
import { Player } from './player.model';
import { State } from './state.model';
import { Enemy } from './enemy.model';
import { Shot } from './shot.model';
import { GameObject } from './gameobject.model';
import { Boss } from './boss.model';
import { Block } from './block.model';
import { Coin } from './coin.model';
import { Explosion } from './explosion.model';

export class CanvasDisplay {
  canvas: HTMLCanvasElement;
  scale = 20;
  cx!: CanvasRenderingContext2D | null;
  viewport!: { left: number; top: number; width: number; height: number };
  fireballSprite = new Image();
  explosionSprite = new Image();
  otherSprites = new Image();
  bossSprite = new Image();
  playerSprites = new Image();
  playerXOverlap = 2;

  constructor(canvas: ElementRef<HTMLCanvasElement>, level: Level) {
    this.canvas = canvas.nativeElement;
    this.canvas.width = Math.min(640, level.width * this.scale);
    this.canvas.height = Math.min(480, level.height * this.scale);
    this.canvas.style.width = 1500 + 'px';
    this.canvas.style.height = 800 + 'px';
    this.cx = this.canvas.getContext('2d');
    this.fireballSprite.src = 'assets/img/fireball.png';
    this.explosionSprite.src = 'assets/img/fireball.png';
    this.otherSprites.src = 'assets/img/sprites.png';
    this.bossSprite.src = 'assets/img/fireball.png';
    this.playerSprites.src = 'assets/img/player.png';

    this.viewport = {
      left: 0,
      top: 0,
      width: this.canvas.width / this.scale,
      height: this.canvas.height / this.scale,
    };
  }

  drawActors(actors: GameObject[]): void {
    for (let actor of actors) {
      let width = actor.size.X * this.scale;
      let height = actor.size.Y * this.scale;
      let x = (actor.pos.X - this.viewport.left) * this.scale;
      let y = (actor.pos.Y - this.viewport.top) * this.scale;
      if (actor instanceof Player) {
        this.drawPlayer(actor, x, y, width, height);
      } else if (actor instanceof Enemy) {
        this.drawPlayer(actor, x, y, width, height);
      } else if (actor instanceof Shot) {
        let tile = 0;
        tile = Math.floor(Date.now() / 80) % 6;
        let tileX = tile * width;
        this.cx?.save();
        if (actor.speed.X < 0) {
          this.flipHorizontally(this.cx, x + width / 2);
        }
        this.cx?.drawImage(
          this.fireballSprite,
          tileX,
          0,
          width,
          height,
          x,
          y,
          width,
          height
        );
        this.cx?.restore();
      } else if (actor instanceof Explosion) {
        let tile = 0;
        tile = Math.floor(actor.delay);
        let tileX = tile * width;
        this.cx?.save();
        this.cx?.drawImage(
          this.explosionSprite,
          tileX,
          height,
          width,
          height,
          x,
          y,
          width,
          height
        );
        this.cx?.restore();
      } else if (actor instanceof Boss) {
        this.drawBoss(actor, x, y, width, height);
      } else if (actor instanceof Block) {
        let tileX = 0 * this.scale;
        this.cx?.drawImage(
          this.otherSprites,
          tileX,
          0,
          width,
          height,
          x,
          y,
          width,
          height
        );
      } else {
        let tileX = (actor instanceof Coin ? 2 : 1) * this.scale;
        this.cx?.drawImage(
          this.otherSprites,
          tileX,
          0,
          width,
          height,
          x,
          y,
          width,
          height
        );
      }
    }
  }

  updateViewport(state: State): void {
    let view = this.viewport,
      margin = view.width / 2;
    let player = state.player;
    if (player == undefined) return;
    let center = player.pos.plus(player.size.times(0.5));
    console.log(center);

    if (center.X < view.left + margin) {
      view.left = Math.max(center.X - margin, 0);
    } else if (center.X > view.left + view.width - margin) {
      view.left = Math.min(
        center.X + margin - view.width,
        state.level.width - view.width
      );
    }
    if (center.Y < view.top + margin) {
      view.top = Math.max(center.Y - margin, 0);
    } else if (center.Y > view.top + view.height - margin) {
      view.top = Math.min(
        center.Y + margin - view.height,
        state.level.height - view.height
      );
    }
  }

  syncState(state: State): void {
    this.updateViewport(state);
    this.clearDisplay(state.status);
    this.drawBackground(state.level);
    this.drawActors(state.actors);
  }

  clearDisplay(status: string): void {
    if (this.cx == null || this.canvas == null) return;
    if (status === 'won') {
      this.cx.fillStyle = 'rgb(68, 191, 255)';
    } else if (status === 'lost') {
      this.cx.fillStyle = 'rgb(44, 136, 214)';
    } else {
      this.cx.fillStyle = 'rgb(52, 166, 251)';
    }
    this.cx.fillRect(0, 0, this.canvas?.width, this.canvas.height);
  }

  drawBoss(
    boss: Boss,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    let sprite = this.bossSprite;
    let tile = 2;
    if (boss.speed.Y !== 0) {
      tile = 2;
    } else if (boss.speed.X !== 0) {
      tile = Math.floor(Date.now() / 120) % 8;
      //tile = 1;
    }

    this.cx?.save();
    if (boss.flipPlayer) {
      boss.dir = false;
      this.flipHorizontally(this.cx, x + width / 2);
    } else {
      boss.dir = true;
    }

    // var tiles = [100, 100, 100, 100, 100, 100, 100, 100];
    width = 100;
    var tileX = 0;
    tileX = tile * 100;

    if (boss.life <= 0) {
      boss.bossColor += 0.05;
      var tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      var tempContext = tempCanvas.getContext('2d');
      tempContext?.drawImage(
        sprite,
        tileX,
        0,
        width,
        height,
        0,
        0,
        width,
        height
      );
      var imageData = tempContext?.getImageData(0, 0, width, height);
      var data = imageData?.data;
      if (data == null) return;
      for (var i = 0; i < data.length; i += 4) {
        //Check alpha value
        if (data[i + 3] !== 0) {
          data[i] = data[i] / boss.bossColor; // red
          data[i + 1] = data[i + 1] / boss.bossColor; // green
          data[i + 2] = data[i + 2] / boss.bossColor; // blue
        }
      }
      if (imageData == null) return;
      tempContext?.putImageData(imageData, 0, 0);
      this.cx?.drawImage(tempCanvas, x, y);
    } else {
      this.cx?.drawImage(
        sprite,
        tileX,
        191,
        width,
        height,
        x,
        y,
        width,
        height
      );
    }
    this.cx?.restore();
  }

  drawPlayer(
    player: GameObject,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    width += this.playerXOverlap * 2;
    x -= this.playerXOverlap;

    let tile = 8;
    if (player.speed.Y !== 0) {
      tile = 9;
    } else if (player.speed.X !== 0) {
      tile = Math.floor(Date.now() / 60) % 8;
    }

    this.cx?.save();
    if (player.flipPlayer) {
      player.dir = false;
      this.flipHorizontally(this.cx, x + width / 2);
    } else {
      player.dir = true;
    }
    let tileX = tile * width;
    this.cx?.drawImage(
      this.playerSprites,
      tileX,
      0,
      width,
      height,
      x,
      y,
      width,
      height
    );
    this.cx?.restore();
  }

  drawBackground(level: Level): void {
    let { left, top, width, height } = this.viewport;
    let xStart = Math.floor(left);
    let xEnd = Math.ceil(left + width);
    let yStart = Math.floor(top);
    let yEnd = Math.ceil(top + height);

    for (let y = yStart; y < yEnd; y++) {
      for (let x = xStart; x < xEnd; x++) {
        let tile = level.rows[y][x];
        if (tile === 'empty') continue;
        let screenX = (x - left) * this.scale;
        let screenY = (y - top) * this.scale;
        let tileX = tile === 'lava' ? this.scale : 0;
        if (this.canvas == null) return;
        if (screenX < 0 || screenX > this.canvas.width - 10) {
          //do not draw anyhing
        } else {
          this.cx?.drawImage(
            this.otherSprites,
            tileX,
            0,
            this.scale,
            this.scale,
            screenX,
            screenY,
            this.scale,
            this.scale
          );
        }
      }
    }
  }
  flipHorizontally(context: any, around: number) {
    context.translate(around, 0);
    context.scale(-1, 1);
    context.translate(-around, 0);
  }
}
