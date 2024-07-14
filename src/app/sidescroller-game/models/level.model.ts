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
type LevelCharValue =
  | 'empty'
  | 'wall'
  | 'lava'
  | typeof Player
  | typeof Coin
  | typeof Block
  | typeof Lava
  | typeof Shot
  | typeof Enemy
  | typeof Explosion
  | typeof Boss;
export class Level {
  levelChars: Record<string, LevelCharValue> = {
    '.': 'empty',
    '#': 'wall',
    '+': Lava,
    p: Player,
    o: Coin,
    b: Block,
    '=': Lava,
    '|': Lava,
    v: Lava,
    M: Shot,
    E: Enemy,
    X: Explosion,
    B: Boss,
    S: Boss,
  };
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
        let type: any = this.levelChars[ch];
        if (typeof type == 'string') return type;
        console.log(typeof type);

        this.startActors.push(type.create(new Vec(x, y)));
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
