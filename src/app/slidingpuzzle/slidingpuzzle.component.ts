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
  ngOnInit(): void {
    this.pieces = new Array();
    this.newGame();
  }

  newGame() {
    let amount = 9;
    for (let i = 0; i < amount - 1; i++) {
      this.pieces.push({
        id: Math.floor(Math.random() * amount),
        number: i + 1,
        blank: false,
      });
    }
    this.pieces.sort((a, b) => a.id - b.id);
    this.pieces.push({ id: 10, number: 0, blank: true });
    console.log(this.pieces);
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
    for (let i = 0; i < this.pieces.length - 2; i++) {
      if (this.pieces[i].number > this.pieces[i + 1].number) {
        sorted = false;
        break;
      }
    }
    this.won = sorted;
  }

  checkAdjacent(idx: number): boolean {
    let adjacents = [-1, 1, -3, 3];
    let yCoord = this.convertToYCoord(idx);
    if (yCoord === 0) {
      adjacents = [1, 3, -3];
    } else if (yCoord === 1) {
      adjacents = [-1, 3, -3];
    }
    for (let i = 0; i < adjacents.length; i++) {
      if (adjacents[i] + idx < 0 || adjacents[i] + idx > 8) continue;
      if (this.pieces[adjacents[i] + idx].blank === true) {
        return true;
      }
    }
    return false;
  }

  convertToYCoord(idx: number): number {
    if (idx === 0 || idx === 3 || idx === 6) {
      return 0;
    }
    if (idx === 2 || idx === 5 || idx === 8) {
      return 1;
    }
    return -1;
  }
}
