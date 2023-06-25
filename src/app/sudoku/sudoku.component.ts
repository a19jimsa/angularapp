import { Component, OnInit } from '@angular/core';
import { Sudoku } from '../sudoku';

@Component({
  selector: 'app-sudoku',
  templateUrl: './sudoku.component.html',
  styleUrls: ['./sudoku.component.css'],
})
export class SudokuComponent implements OnInit {
  values!: Sudoku[];
  tempValues!: Sudoku[];
  id!: number;
  won!: boolean;
  menu!: boolean;

  constructor() {}

  ngOnInit(): void {
    this.id = 0;
    this.won = false;
    this.menu = false;
    this.newGame();
  }

  newGame(): void {
    this.values = new Array();
    this.tempValues = new Array();
    let sudokuStr =
      '...2.........6.4...1..4.7....81..5.735...6.1....47..86.2....1...81....6267.......';
    for (let i = 0; i < 81; i++) {
      this.values.push({
        value: sudokuStr[i],
        active: false,
        locked: false,
        hidden: false,
      });
      if (this.values[i].value !== '.') {
        this.values[i].locked = true;
      }
    }
  }

  makeMove(idx: number): void {
    this.menu = true;
    this.tempValues = [];
    console.log(this.values);
    if (this.values[idx].locked) return;

    this.setInactive();
    this.values[idx].active = true;
    this.id = idx;
    let offset = 9;
    while (idx + offset <= 80) {
      this.tempValues.push(this.values[idx + offset]);
      offset += 9;
    }
    offset = -9;
    while (idx + offset >= 0) {
      this.tempValues.push(this.values[idx + offset]);
      offset += -9;
    }

    let startPoints = [0, 9, 18, 27, 36, 45, 54, 63, 72];
    let endPoints = [8, 17, 26, 35, 44, 53, 62, 71, 80];
    offset = -1;
    while (!endPoints.includes(idx + offset)) {
      if (idx + offset < 0) break;
      this.tempValues.push(this.values[idx + offset]);
      offset += -1;
    }
    offset = 1;
    while (!startPoints.includes(idx + offset)) {
      if (idx + offset > 80) break;
      this.tempValues.push(this.values[idx + offset]);
      offset += 1;
    }
  }

  checkWin() {
    let sum = 0;
    //Check horisontal
    for (let i = 0; i < 81; i++) {
      sum += Number(this.values[i].value);
      if ((i + 1) % 9 === 0) {
        if (sum !== 45) return;
        sum = 0;
      }
    }
    sum = 0;
    //Check vertical
    let offset = 9;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        sum += Number(this.values[i + j * offset].value);
      }
      if (sum !== 45) {
        return;
      }
      sum = 0;
    }
    this.won = true;
  }

  printValue(value: string) {
    if (!this.values[this.id].locked) this.values[this.id].value = value;
    this.menu = false;
    this.values.forEach((x) => {
      if (x.value === '.') return;
    });
    this.checkWin();
  }

  setInactive() {
    for (let i = 0; i < this.values.length; i++) {
      this.values[i].active = false;
    }
  }
}
