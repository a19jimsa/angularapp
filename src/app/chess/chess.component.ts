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

  constructor() {}

  //Runs when init game from creating game
  ngOnInit(): void {
    this.newGame();
  }

  newGame() {
    this.squares = new Array();
    for (var i = 0; i < 64; i++) {
      if (i > 47) {
        this.squares.push({
          type: '',
          color: 'white',
          position: i,
          active: false,
        });
      } else if (i == 28) {
        this.squares.push({
          type: 'horse',
          color: 'white',
          position: i,
          active: false,
        });
      } else {
        this.squares.push({
          type: '',
          color: 'white',
          position: i,
          active: false,
        });
      }
    }
    this.winner = '';
    this.xIsNext = true;
    console.log(this.squares);
  }

  get player() {
    return this.xIsNext
      ? { color: 'black', position: 1 }
      : { color: 'green', position: 2 };
  }

  makeMove(idx: number) {
    //Helpoer
    const type = this.squares[idx].type;
    const color = this.squares[idx].color;
    const active = this.squares.findIndex((element) => element.active == true);
    console.log(active);
    if (type === 'bonde' && active == -1) {
      console.log(this.squares);
      this.squares[idx].active = true;
      let offset = 8;
      if (this.squares[idx - offset].type == '') {
        this.squares.splice(idx - offset, 1, {
          type: '',
          color: 'yellow',
          position: idx - offset,
          active: false,
        });
      } else {
        return;
      }
      if (this.squares[idx - offset * 2].type == '') {
        this.squares.splice(idx - offset * 2, 1, {
          type: '',
          color: 'yellow',
          position: idx - offset * 2,
          active: false,
        });
      }
    } else if (type == 'horse' && active == -1) {
      this.squares[idx].active = true;
      for (var i = 0; i < 8; i++) {
        let offset = 0;
        if (i == 0) {
          if (
            idx == 7 ||
            idx == 15 ||
            idx == 23 ||
            idx == 31 ||
            idx == 39 ||
            idx == 47 ||
            idx == 55 ||
            idx == 63
          ) {
            continue;
          }
          offset = -17;
        } else if (i == 1) {
          if (
            idx == 0 ||
            idx == 8 ||
            idx == 16 ||
            idx == 24 ||
            idx == 32 ||
            idx == 40 ||
            idx == 48
          ) {
            continue;
          }

          offset = -15;
        } else if (i == 2) {
          if (
            idx == 7 ||
            idx == 15 ||
            idx == 23 ||
            idx == 31 ||
            idx == 39 ||
            idx == 47 ||
            idx == 55 ||
            idx == 63
          ) {
            continue;
          }
          if (
            idx == 6 ||
            idx == 14 ||
            idx == 22 ||
            idx == 30 ||
            idx == 38 ||
            idx == 46 ||
            idx == 54 ||
            idx == 62
          ) {
            continue;
          }
          offset = -10;
        } else if (i == 3) {
          if (
            idx == 0 ||
            idx == 8 ||
            idx == 16 ||
            idx == 24 ||
            idx == 32 ||
            idx == 40 ||
            idx == 48 ||
            idx == 56
          ) {
            continue;
          }
          if (
            idx == 1 ||
            idx == 9 ||
            idx == 17 ||
            idx == 25 ||
            idx == 33 ||
            idx == 41 ||
            idx == 49 ||
            idx == 57
          ) {
            continue;
          }
          offset = -6;
        } else if (i == 4) {
          if (
            idx == 7 ||
            idx == 15 ||
            idx == 23 ||
            idx == 31 ||
            idx == 39 ||
            idx == 47 ||
            idx == 55 ||
            idx == 63
          ) {
            continue;
          }
          if (
            idx == 6 ||
            idx == 14 ||
            idx == 22 ||
            idx == 30 ||
            idx == 38 ||
            idx == 46 ||
            idx == 54 ||
            idx == 62
          ) {
            continue;
          }
          offset = 6;
        } else if (i == 5) {
          if (
            idx == 0 ||
            idx == 8 ||
            idx == 16 ||
            idx == 24 ||
            idx == 32 ||
            idx == 40 ||
            idx == 48 ||
            idx == 56
          ) {
            continue;
          }
          if (
            idx == 1 ||
            idx == 9 ||
            idx == 17 ||
            idx == 25 ||
            idx == 33 ||
            idx == 41 ||
            idx == 49 ||
            idx == 57
          ) {
            continue;
          }

          offset = 10;
        } else if (i == 6) {
          if (
            idx == 7 ||
            idx == 15 ||
            idx == 23 ||
            idx == 31 ||
            idx == 39 ||
            idx == 47 ||
            idx == 55 ||
            idx == 63
          ) {
            continue;
          }
          offset = 15;
        } else if (i == 7) {
          if (
            idx == 0 ||
            idx == 8 ||
            idx == 16 ||
            idx == 24 ||
            idx == 32 ||
            idx == 40 ||
            idx == 48
          ) {
            continue;
          }
          offset = 17;
        }
        if (idx - offset > 63 || idx - offset < 0) continue;
        if (this.squares[idx - offset].type == '') {
          this.squares.splice(idx - offset, 1, {
            type: '',
            color: 'yellow',
            position: idx - offset,
            active: false,
          });
        }
      }
    } else {
      this.clear();
    }
    if (color === 'yellow' && active > -1) {
      console.log(this.squares);
      var temp = this.squares[active];
      this.squares[active] = this.squares[idx];
      this.squares[idx] = temp;
      this.clear();
    }
  }
  clear() {
    for (var i = 0; i < 64; i++) {
      this.squares[i].color = 'white';
      this.squares[i].active = false;
    }
  }
}
