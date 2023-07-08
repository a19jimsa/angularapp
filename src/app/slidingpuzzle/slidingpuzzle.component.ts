import { Component, OnInit } from '@angular/core';
import { Piece } from '../piece';

@Component({
  selector: 'app-slidingpuzzle',
  templateUrl: './slidingpuzzle.component.html',
  styleUrls: ['./slidingpuzzle.component.css'],
})
export class SlidingpuzzleComponent implements OnInit {
  pieces!: Piece[];
  won!: boolean;
  amount = 0;
  ngOnInit(): void {
    this.newGame();
  }

  newGame() {
    this.pieces = new Array();
    this.amount = 16;
    for (let i = 0; i < this.amount - 1; i++) {
      this.pieces.push({
        id: Math.floor(Math.random() * 100),
        number: i + 1,
        blank: false,
        amount: this.amount,
      });
    }
    this.pieces.sort((a, b) => a.id - b.id);
    this.pieces.push({
      id: 0,
      number: this.amount,
      blank: true,
      amount: this.amount,
    });
    this.checkInversions();
  }

  checkInversions() {
    let countPolarity = 0;
    for (let i = 0; i < this.pieces.length - 1; i++) {
      for (let j = i; j < this.pieces.length; j++) {
        if (
          this.pieces[i].number === this.amount ||
          this.pieces[j].number === this.amount
        )
          continue;
        if (this.pieces[i].number > this.pieces[j].number) {
          countPolarity++;
          console.log(this.pieces[i].number + '>' + this.pieces[j].number);
        }
      }
    }
    if (countPolarity % 2 === 0) {
      console.log('Solveable');
    } else {
      this.newGame();
    }
  }

  makeMove(idx: number): void {
    for (let i = 0; i < this.pieces.length; i++) {
      if (this.pieces[i].blank === true) {
        if (!this.checkAdjacent(idx)) continue;
        this.pieces[i] = this.pieces.splice(idx, 1, this.pieces[i])[0];
        break;
      }
    }
    let sorted = true;
    for (let i = 0; i < this.pieces.length - 1; i++) {
      if (this.pieces[i].number > this.pieces[i + 1].number) {
        sorted = false;
        break;
      }
    }
    if (sorted) {
      this.pieces[this.pieces.length - 1].blank = false;
    }
    this.won = sorted;
  }

  checkAdjacent(idx: number): boolean {
    let adjacents = [-1, 1, -Math.sqrt(this.amount), Math.sqrt(this.amount)];
    let yCoord = this.convertToYCoord(idx);
    if (yCoord === 0) {
      adjacents = [1, -Math.sqrt(this.amount), Math.sqrt(this.amount)];
    } else if (yCoord === 1) {
      adjacents = [-1, -Math.sqrt(this.amount), Math.sqrt(this.amount)];
    }
    for (let i = 0; i < adjacents.length; i++) {
      if (adjacents[i] + idx < 0 || adjacents[i] + idx > this.amount - 1)
        continue;
      if (this.pieces[adjacents[i] + idx].blank === true) {
        return true;
      }
    }
    return false;
  }

  convertToYCoord(idx: number): number {
    let column1 = [];
    let column2 = [];

    for (let i = 0; i < Math.sqrt(this.amount); i++) {
      column1.push(i * Math.sqrt(this.amount));
    }
    for (let i = 0; i < Math.sqrt(this.amount); i++) {
      column2.push(i * Math.sqrt(this.amount) + Math.sqrt(this.amount));
    }
    if (column1.includes(idx)) {
      return 0;
    }
    if (column2.includes(idx)) {
      return 1;
    }
    return -1;
  }
}
