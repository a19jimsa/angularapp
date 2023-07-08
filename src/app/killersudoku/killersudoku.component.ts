import { Component } from '@angular/core';
import { Sudoku } from '../sudoku';

@Component({
  selector: 'app-killersudoku',
  templateUrl: './killersudoku.component.html',
  styleUrls: ['./killersudoku.component.css'],
})
export class KillersudokuComponent {
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
    const finishedStr =
      '745281639839567421216349758468123597357896214192475386924658173581734962673912845';
    for (let i = 0; i < 81; i++) {
      this.values.push({
        value: sudokuStr[i],
        active: false,
        locked: false,
        hidden: false,
        block: 'none',
        blockValue: 0,
      });
      if (this.values[i].value !== '.') {
        this.values[i].locked = true;
      }
    }
    while (this.values.find((x) => x.block === 'none') !== undefined) {
      this.createShape();
    }
  }

  makeMove(idx: number): void {
    if (this.values[idx].locked) return;
    this.menu = true;
    this.tempValues = [];
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

  createShape() {
    const finishedStr =
      '745281639839567421216349758468123597357896214192475386924658173581734962673912845';
    let shapes = [
      [0, 9, 18],
      [0, 9, 8, 7],
      [0, 9, 18, 27],
      [0, 1, 2],
      [0, 1, 2, 3],
      [0, -1, -2, -3],
      [0, 1, 9, 10],
      [0, 9, 10, 8],
      [0, 9, 8, 17],
    ];
    let corners = [
      0, 9, 18, 27, 36, 45, 54, 63, 72, 8, 17, 26, 35, 44, 53, 62, 71, 80,
    ];
    let colors = ['red', 'blue', 'green'];
    let number = 0;
    for (let j = 0; j < 81; j++) {
      if (this.values[j].block !== 'none') continue;
      const rand = Math.floor(Math.random() * shapes.length);
      const color = colors[number];
      number++;
      if (number === 3) {
        number = 0;
      }
      for (let i = 0; i < shapes[rand].length; i++) {
        if (j + shapes[rand][i] < 0 || j + shapes[rand][i] > 80) break;
        if (this.values[j + shapes[rand][i]].block !== 'none') break;
        this.values[j + shapes[rand][i]].block = color;
        this.values[j].blockValue += Number(finishedStr[j + shapes[rand][i]]);
        if (corners.includes(j + shapes[rand][i])) break;
      }
    }
  }
}
