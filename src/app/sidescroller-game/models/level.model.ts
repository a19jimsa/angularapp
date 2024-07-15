import { Player } from './player.model';
import { Vec } from './vec.model';
import { Explosion } from './explosion.model';
import { Coin } from './coin.model';
import { Lava } from './lava.model';
import { Shot } from './shot.model';
import { Boss } from './boss.model';
import { Enemy } from './enemy.model';
import { Block } from './block.model';
import { GameObject } from './gameobject.model';
export class Level {
  height: number;
  width: number;
  startActors: GameObject[] = [];
  rows: string[][];
  constructor(plan: string) {
    let rows = plan
      .trim()
      .split('\n')
      .map((l) => [...l]);
    this.height = rows.length;
    this.width = rows[0].length;
    this.startActors = [];

    this.rows = rows.map((row, y) => {
      return row.map((ch, x) => {
        console.log(ch);
        switch (ch) {
          case '.':
            return 'empty';
          case '#':
            return 'wall';
          case 'p':
            this.startActors.push(Player.create(new Vec(x, y)));
            return 'empty';
          case 'o':
            this.startActors.push(Coin.create(new Vec(x, y)));
            return 'empty';
          case '+':
            this.startActors.push(Lava.create(new Vec(x, y)));
            return 'empty';
          case 'E':
            this.startActors.push(Enemy.create(new Vec(x, y)));
            return 'empty';
          case '|':
            this.startActors.push(Lava.create(new Vec(x, y)));
            return 'empty';
          case 'b':
            this.startActors.push(Boss.create(new Vec(x, y)));
            return 'empty';
        }
        return 'empty';
      });
    });
  }
  touches(pos: Vec, size: Vec, type: string): boolean {
    let xStart = Math.floor(pos.X);
    let xEnd = Math.ceil(pos.X + size.X);
    let yStart = Math.floor(pos.Y);
    let yEnd = Math.ceil(pos.Y + size.Y);

    for (let y = yStart; y < yEnd; y++) {
      for (let x = xStart; x < xEnd; x++) {
        let isOutside = x < 0 || x >= this.width || y < 0 || y >= this.height;
        let here = isOutside ? 'wall' : this.rows[y][x];
        if (here === type) return true;
      }
    }
    return false;
  }
}
