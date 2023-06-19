import { Component, OnInit } from '@angular/core';
import { MineComponent } from '../mine/mine.component';
import { Mine } from '../mine';

@Component({
  selector: 'app-minesweeper',
  templateUrl: './minesweeper.component.html',
  styleUrls: ['./minesweeper.component.css']
})
export class MinesweeperComponent implements OnInit {
  mines!: Mine[];
  xIsNext!: boolean;
  constructor() { }

  ngOnInit(): void {
    this.mines = new Array();
    this.newGame();
  }
  get player() {
    return this.xIsNext ? { color: 'black' } : { color: 'white' };
  }

  newGame() {
    for (let i = 0; i < 81; i++) {
      this.mines.push({id: i, type: "", count: 0, pressed: false, checked: false });
    }
    this.createMines();
  }

  createMines(): void {
    let tempArray = new Array();
    let amountMine = 10;
    for (let i = 0; i < amountMine; i++) {
      let number = Math.floor(Math.random() * 81);
      while (tempArray.includes(number)) {
        number = Math.floor(Math.random() * 81);
      }
      this.mines.splice(number, 1, {id: number, type: "mine", count: 0, pressed: false, checked: false });
      tempArray.push(number);
      this.createAdjacentNumber(number);
    }
  }

  createAdjacentNumber(id: number): void {
    let offsets = [-10, -9, -8, -1, 1, 8, 9, 10];
    for (let i = 0; i < offsets.length; i++) {
      if (id + offsets[i] < 0 || id + offsets[i] > 80) continue;
      let number = this.convertToYCoord(id);
      if (number === 1 && offsets[i] === -10) continue;
      if (number === 1 && offsets[i] === -1) continue;
      if (number === 1 && offsets[i] === 8) continue;
      if (number === 2 && offsets[i] === -8) continue;
      if (number === 2 && offsets[i] === 1) continue;
      if (number === 2 && offsets[i] === 10) continue;
      let countNumber = this.mines[id + offsets[i]].count;
      countNumber++;
      if (this.mines[id + offsets[i]].type === "mine") continue;
      this.mines.splice(id + offsets[i], 1, { id: id+offsets[i], type: "number", count: countNumber, pressed: false, checked: false });
    }
  }

  makeMove(idx: number): void {
    let offsets = [-10, -9, -8, -1, 1, 8, 9, 10];
    let startPosition = idx;
    let tempArray: Mine[] = new Array();
    this.mines[idx].pressed = true;
    if (this.mines[idx].type === "") {
      for (let i = 0; i < offsets.length; i++) {
        let number = this.convertToYCoord(idx);
        if (number === 1 && offsets[i] === -10) continue;
        if (number === 1 && offsets[i] === -1) continue;
        if (number === 1 && offsets[i] === 8) continue;
        if (number === 2 && offsets[i] === -8) continue;
        if (number === 2 && offsets[i] === 1) continue;
        if (number === 2 && offsets[i] === 10) continue;
        if (idx + offsets[i] < 0 || idx + offsets[i] > 80) continue;
        if(this.mines[idx+offsets[i]].checked === false){
          tempArray.push(this.mines[idx+offsets[i]]);
          this.mines[idx+offsets[i]].checked = true;
        }
      }
    }
    this.checkRoute(tempArray);
  }

  checkRoute(tempArray: Mine[]): void {
    for(let i = 0; i < tempArray.length; i++){
      this.makeMove(tempArray[i].id);
    }
  }

  convertToYCoord(idx: number): number {
    let column1 = [0, 9, 18, 27, 36, 45, 54, 63, 72];
    let column2 = [8, 17, 26, 35, 44, 53, 62, 71, 80];

    if (column1.includes(idx)) {
      return 1;
    } else if (column2.includes(idx)) {
      return 2;
    }
    return -1;
  }

}
