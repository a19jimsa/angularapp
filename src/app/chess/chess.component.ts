import { Component, OnInit } from '@angular/core';
import { Player } from '../player';

@Component({
  selector: 'app-chess',
  templateUrl: './chess.component.html',
  styleUrls: ['./chess.component.css'],
})
export class ChessComponent implements OnInit {
  squares!: Player[];
  xIsNext!: boolean;
  winner!: string;
  tempPlayers!: any[];

  constructor() {}

  //Runs when init game from creating game
  ngOnInit(): void {
    this.newGame();
  }

  newGame() {
    this.squares = new Array();
    this.tempPlayers = new Array();
    let board = [
      'tb',
      'hb',
      'lb',
      'qb',
      'kb',
      'lb',
      'hb',
      'tb',
      'bb',
      'bb',
      'bb',
      'bb',
      'bb',
      'bb',
      'bb',
      'bb',
      'w',
      'w',
      'w',
      'w',
      'w',
      'w',
      'w',
      'w',
      'w',
      'w',
      'w',
      'w',
      'w',
      'w',
      'w',
      'w',
      'w',
      'w',
      'w',
      'w',
      'w',
      'w',
      'w',
      'w',
      'w',
      'w',
      'w',
      'w',
      'w',
      'w',
      'w',
      'w',
      'bw',
      'bw',
      'bw',
      'bw',
      'bw',
      'bw',
      'bw',
      'bw',
      'tw',
      'hw',
      'lw',
      'qw',
      'kw',
      'lw',
      'hw',
      'tw',
    ];
    for (var i = 0; i < 64; i++) {
      let color: string;
      if (i > 32) {
        color = 'white';
      } else {
        color = 'black';
      }
      switch (board[i]) {
        case 'tb':
          this.squares.push({
            hex: '\u{265C}',
            type: 'tower',
            color: color,
            position: i,
            active: false,
            draw: 0,
          });
          break;
        case 'lb':
          this.squares.push({
            hex: '\u{265D}',
            type: 'lopare',
            color: color,
            position: i,
            active: false,
            draw: 0,
          });
          break;
        case 'hb':
          this.squares.push({
            hex: '\u{265E}',
            type: 'horse',
            color: color,
            position: i,
            active: false,
            draw: 0,
          });
          break;
        case 'qb':
          this.squares.push({
            hex: '\u{265B}',
            type: 'queen',
            color: color,
            position: i,
            active: false,
            draw: 0,
          });
          break;
        case 'kb':
          this.squares.push({
            hex: '\u{265A}',
            type: 'king',
            color: color,
            position: i,
            active: false,
            draw: 0,
          });
          break;
        case 'bb':
          this.squares.push({
            hex: '\u{265F}',
            type: 'bonde',
            color: color,
            position: i,
            active: false,
            draw: 0,
          });
          break;
        case 'tw':
          this.squares.push({
            hex: '\u{2656}',
            type: 'tower',
            color: color,
            position: i,
            active: false,
            draw: 0,
          });
          break;
        case 'lw':
          this.squares.push({
            hex: '\u{2657}',
            type: 'lopare',
            color: color,
            position: i,
            active: false,
            draw: 0,
          });
          break;
        case 'hw':
          this.squares.push({
            hex: '\u{2658}',
            type: 'horse',
            color: color,
            position: i,
            active: false,
            draw: 0,
          });
          break;
        case 'qw':
          this.squares.push({
            hex: '\u{2655}',
            type: 'queen',
            color: color,
            position: i,
            active: false,
            draw: 0,
          });
          break;
        case 'kw':
          this.squares.push({
            hex: '\u{2654}',
            type: 'king',
            color: color,
            position: i,
            active: false,
            draw: 0,
          });
          break;
        case 'bw':
          this.squares.push({
            hex: '\u{2659}',
            type: 'bonde',
            color: color,
            position: i,
            active: false,
            draw: 0,
          });
          break;
        default:
          this.squares.push({
            hex: '',
            type: '',
            color: '',
            position: i,
            active: false,
            draw: 0,
          });
      }
    }
    this.winner = '';
    this.xIsNext = false;
  }

  get player() {
    return this.xIsNext
      ? { color: 'black', position: 2 }
      : { color: 'white', position: 1 };
  }

  makeMove(idx: number) {
    if (this.squares[idx].color !== this.player.color) {
      if (this.squares[idx].color !== 'yellow') {
        return;
      }
    }
    //Helper variables for faster access
    const type = this.squares[idx].type;
    const color = this.squares[idx].color;
    const active = this.squares.findIndex((element) => element.active == true);
    console.log(this.squares[idx]);

    if (type === 'bonde' && active === -1) {
      this.squares[idx].active = true;
      let color = this.squares[idx].color;
      let coord = this.convertToYCoord(idx);
      if (color === 'black') {
        let num = 2;
        let offset = -8;
        if (this.squares[idx].draw > 0) {
          num = 1;
        } else {
          num = 2;
        }
        if (idx - -16 < 63) {
          if (this.squares[idx - -16].type !== '') {
            num = 1;
          }
        }

        if (this.squares[idx - -8].type !== '') {
          num = 0;
        }

        this.createPath(num, offset, idx);
        if (coord !== 0) {
          if (this.squares[idx - -7].type !== '') {
            this.createPath(1, -7, idx);
          }
        }
        if (coord !== 7) {
          if (this.squares[idx - -9].type !== '') {
            this.createPath(1, -9, idx);
          }
        }
      }

      if (color === 'white') {
        let num = 2;
        let offset = 8;
        if (this.squares[idx].draw > 0) {
          num = 1;
        }

        if (idx - 16 > 0) {
          if (this.squares[idx - 16].type !== '') {
            num = 1;
          }
        }

        if (this.squares[idx - 8].type !== '') {
          num = 0;
        }
        this.createPath(num, offset, idx);
        if (coord !== 7) {
          if (this.squares[idx - 7].type !== '') {
            this.createPath(1, 7, idx);
          }
        }
        if (coord !== 0) {
          if (this.squares[idx - 9].type !== '') {
            this.createPath(1, 9, idx);
          }
        }
      }
    } else if (type == 'horse' && active == -1) {
      this.squares[idx].active = true;
      let coord = this.convertToYCoord(idx);
      let offsets = [-17, -15, -10, -6, 6, 10, 15, 17];
      for (let i = 0; i < offsets.length; i++) {
        if (i == 0) {
          if (coord === 7) {
            continue;
          }
        } else if (i === 1) {
          if (coord === 0) {
            continue;
          }
        } else if (i === 2) {
          if (coord === 6) {
            continue;
          }
          if (coord === 7) {
            continue;
          }
        } else if (i === 3) {
          if (coord === 0) {
            continue;
          }
          if (coord === 1) {
            continue;
          }
        } else if (i == 4) {
          if (coord === 7) {
            continue;
          }
          if (coord === 6) {
            continue;
          }
        } else if (i == 5) {
          if (coord === 0) {
            continue;
          }
          if (coord === 1) {
            continue;
          }
        } else if (i == 6) {
          if (coord === 7) {
            continue;
          }
        } else if (i == 7) {
          if (coord === 0) {
            continue;
          }
        }
        this.createPath(1, offsets[i], idx);
      }
    } else if (type === 'lopare' && active === -1) {
      this.squares[idx].active = true;
      let coord = this.convertToYCoord(idx);
      let right = 8 - coord - 1;
      let left = coord;
      let value = 0;
      let num = 0;
      for (let i = 0; i < 4; i++) {
        if (i == 0) {
          value = 7;
          num = right;
        } else if (i == 1) {
          value = 9;
          num = left;
        } else if (i == 2) {
          value = -7;
          num = left;
        } else if (i == 3) {
          value = -9;
          num = right;
        } else {
          return;
        }
        this.createPath(num, value, idx);
      }
    } else if (type === 'queen' && active === -1) {
      this.squares[idx].active = true;
      let coord = this.convertToYCoord(idx);
      let right = 8 - coord - 1;
      let left = coord;
      let value = 0;
      let num = 0;
      for (let i = 0; i < 8; i++) {
        if (i == 0) {
          value = 7;
          num = right;
        } else if (i == 1) {
          value = 9;
          num = left;
        } else if (i == 2) {
          value = -7;
          num = left;
        } else if (i == 3) {
          value = 1;
          num = left;
        } else if (i == 4) {
          value = -1;
          num = right;
        } else if (i == 5) {
          value = -9;
          num = right;
        } else if (i == 6) {
          value = 8;
          num = 8;
        } else if (i == 7) {
          value = -8;
          num = 8;
        } else {
          return;
        }
        this.createPath(num, value, idx);
      }
    } else if (type === 'tower' && active === -1) {
      this.squares[idx].active = true;
      let coord = this.convertToYCoord(idx);
      let right = 8 - coord - 1;
      let left = coord;
      let value = 0;
      let num = 0;
      for (let i = 0; i < 4; i++) {
        if (i == 0) {
          value = 1;
          num = left;
        } else if (i == 1) {
          value = -1;
          num = right;
        } else if (i == 2) {
          value = 8;
          num = 8;
        } else if (i == 3) {
          value = -8;
          num = 8;
        } else {
          return;
        }
        this.createPath(num, value, idx);
      }
    } else if (type === 'king' && active === -1) {
      this.squares[idx].active = true;
      let coord = this.convertToYCoord(idx);
      let offsets = [-9, -8, -7, -1, 1, 7, 8, 9];
      for (let i = 0; i < offsets.length; i++) {
        if (coord == 7 && i == 1) {
          continue;
        } else if (coord == 0 && i == 2) {
          continue;
        }
        let value = offsets[i];
        let offset = value;
        this.createPath(1, offset, idx);
      }
    } else {
      this.clear();
    }

    //move player to yellow position
    if (color === 'yellow' && active > -1) {
      var temp = this.squares[active];
      this.squares[active] = this.squares[idx];
      this.squares[idx] = temp;
      this.squares[idx].draw++;
      this.clear();
      this.xIsNext = !this.xIsNext;
    }
    if (color == 'yellow' && active > -1 && this.squares[idx].type != '') {
      this.squares.splice(active, 1, {
        hex: '',
        type: '',
        color: '',
        position: active,
        active: false,
        draw: 0,
      });
    }
  }

  clear() {
    for (var i = 0; i < 64; i++) {
      this.squares[i].active = false;
      if (this.squares[i].color == 'yellow') {
        this.squares[i].color = 'white';
      }
      for (let j = 0; j < this.tempPlayers.length; j++) {
        let id = this.tempPlayers[j].id;
        if (id === i) {
          this.squares[i].color = this.tempPlayers[j].color;
        }
      }
    }
    this.tempPlayers = [];
  }

  convertToYCoord(idx: number) {
    let column1 = [0, 1, 2, 3, 4, 5, 6, 7];
    let column2 = [8, 9, 10, 11, 12, 13, 14, 15];
    let column3 = [16, 17, 18, 19, 20, 21, 22, 23];
    let column4 = [24, 25, 26, 27, 28, 29, 30, 31];
    let column5 = [32, 33, 34, 35, 36, 37, 38, 39];
    let column6 = [40, 41, 42, 43, 44, 45, 46, 47];
    let column7 = [48, 49, 50, 51, 52, 53, 54, 55];
    let column8 = [56, 57, 58, 59, 60, 61, 62, 63];

    if (column1.findIndex((value) => value == idx) != -1) {
      return column1.findIndex((value) => value == idx);
    } else if (column2.findIndex((value) => value == idx) != -1) {
      return column2.findIndex((value) => value == idx);
    } else if (column3.findIndex((value) => value == idx) != -1) {
      return column3.findIndex((value) => value == idx);
    } else if (column4.findIndex((value) => value == idx) != -1) {
      return column4.findIndex((value) => value == idx);
    } else if (column5.findIndex((value) => value == idx) != -1) {
      return column5.findIndex((value) => value == idx);
    } else if (column6.findIndex((value) => value == idx) != -1) {
      return column6.findIndex((value) => value == idx);
    } else if (column7.findIndex((value) => value == idx) != -1) {
      return column7.findIndex((value) => value == idx);
    } else if (column8.findIndex((value) => value == idx) != -1) {
      return column8.findIndex((value) => value == idx);
    }
    return -1;
  }
  //Create path for unit
  createPath(num: number, value: number, idx: number) {
    for (let i = 0; i < num; i++) {
      let offset = value * (i + 1);
      if (idx - offset > 63 || idx - offset < 0) break;
      if (this.squares[idx - offset].type === '') {
        this.squares.splice(idx - offset, 1, {
          hex: '',
          type: '',
          color: 'yellow',
          position: idx - offset,
          active: false,
          draw: 0,
        });
      } else if (this.squares[idx - offset].type !== '') {
        if (this.squares[idx - offset].color == this.squares[idx].color) {
          break;
        }
        this.tempPlayers.push({
          id: idx - offset,
          color: this.squares[idx - offset].color,
        });
        this.squares[idx - offset].color = 'yellow';
        break;
      } else {
        break;
      }
    }
  }
}
