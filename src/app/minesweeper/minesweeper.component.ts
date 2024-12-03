import { Component, OnInit } from '@angular/core';
import { Mine } from '../mine';

@Component({
    selector: 'app-minesweeper',
    templateUrl: './minesweeper.component.html',
    styleUrls: ['./minesweeper.component.css'],
    standalone: false
})
export class MinesweeperComponent implements OnInit {
  mines!: Mine[];
  xIsNext!: boolean;
  won!: boolean;
  lost!: boolean;
  type!: number;
  private amountMine!: number;
  private rows!: number;
  private columns!: number;
  private offsets!: number[];
  constructor() {}

  ngOnInit(): void {
    this.newGame(1);
  }

  newGame(type: number): void {
    this.type = type;
    this.won = false;
    this.lost = false;
    this.mines = new Array();
    this.columns = 9;
    this.rows = 9;
    this.offsets = [-10, -9, -8, -1, 1, 8, 9, 10];
    this.amountMine = 10;
    if (this.type === 2) {
      this.amountMine = 40;
      this.columns = 16;
      this.rows = 16;
      this.offsets = [-17, -16, -15, -1, 1, 15, 16, 17];
    } else if (this.type === 3) {
      this.amountMine = 99;
      this.columns = 30;
      this.rows = 16;
      this.offsets = [-31, -30, -29, -1, 1, 29, 30, 31];
    }

    for (let i = 0; i < this.rows * this.columns; i++) {
      this.mines.push({
        id: i,
        type: '',
        count: 0,
        pressed: false,
        checked: false,
      });
    }
    this.createMines(this.rows * this.columns);
  }

  createMines(gridNr: number): void {
    let tempArray = new Array();
    for (let i = 0; i < this.amountMine; i++) {
      let number = Math.floor(Math.random() * gridNr);
      while (tempArray.includes(number)) {
        number = Math.floor(Math.random() * gridNr);
      }
      this.mines.splice(number, 1, {
        id: number,
        type: 'mine',
        count: 0,
        pressed: false,
        checked: false,
      });
      tempArray.push(number);
      this.createAdjacentNumber(number);
    }
  }

  createAdjacentNumber(id: number): void {
    for (let i = 0; i < this.offsets.length; i++) {
      if (
        id + this.offsets[i] < 0 ||
        id + this.offsets[i] > this.rows * this.columns - 1
      )
        continue;
      let number = this.convertToYCoord(id);
      if (number === 1 && i === 0) continue;
      if (number === 1 && i === 3) continue;
      if (number === 1 && i === 5) continue;
      if (number === 2 && i === 2) continue;
      if (number === 2 && i === 4) continue;
      if (number === 2 && i === 7) continue;
      let countNumber = this.mines[id + this.offsets[i]].count;
      countNumber++;
      if (this.mines[id + this.offsets[i]].type === 'mine') continue;
      this.mines.splice(id + this.offsets[i], 1, {
        id: id + this.offsets[i],
        type: 'number',
        count: countNumber,
        pressed: false,
        checked: false,
      });
    }
  }

  makeMove(idx: number): void {
    if (this.lost) {
      return;
    }
    let tempArray: Mine[] = new Array();
    this.mines[idx].pressed = true;
    if (this.mines[idx].type === 'mine') {
      for (let i = 0; i < this.mines.length; i++) {
        if (this.mines[i].type === 'mine') {
          this.mines[i].pressed = true;
        }
      }
      this.lost = true;
      return;
    }
    if (this.mines[idx].type === '') {
      for (let i = 0; i < this.offsets.length; i++) {
        let number = this.convertToYCoord(idx);
        if (number === 1 && i === 0) continue;
        if (number === 1 && i === 3) continue;
        if (number === 1 && i === 5) continue;
        if (number === 2 && i === 2) continue;
        if (number === 2 && i === 4) continue;
        if (number === 2 && i === 7) continue;
        if (
          idx + this.offsets[i] < 0 ||
          idx + this.offsets[i] > this.columns * this.rows - 1
        )
          continue;
        if (this.mines[idx + this.offsets[i]].checked === false) {
          tempArray.push(this.mines[idx + this.offsets[i]]);
          this.mines[idx + this.offsets[i]].checked = true;
        }
      }
    }
    this.checkRoute(tempArray);
    this.checkWin();
  }

  checkRoute(tempArray: Mine[]): void {
    for (let i = 0; i < tempArray.length; i++) {
      this.makeMove(tempArray[i].id);
    }
  }

  checkWin() {
    let win = this.mines.findIndex(
      (e) => e.pressed === false && e.type === 'number'
    );
    if (win === -1) {
      this.won = true;
    }
  }

  convertToYCoord(idx: number): number {
    let column1 = [];
    let column2 = [];

    for (let i = 0; i < this.rows; i++) {
      column1.push(i * this.columns);
    }
    for (let i = 0; i < this.rows; i++) {
      column2.push(i * this.columns + this.columns - 1);
    }

    if (column1.includes(idx)) {
      return 1;
    } else if (column2.includes(idx)) {
      return 2;
    }
    return -1;
  }
}
