import { Component, OnInit, HostListener } from '@angular/core';
import { SnakeTile } from '../snake-tile';

@Component({
  selector: 'app-snake',
  templateUrl: './snake.component.html',
  styleUrls: ['./snake.component.css'],
})
export class SnakeComponent implements OnInit {
  tiles!: SnakeTile[];
  snakeList!: number[];
  apple!: number;
  offset!: number;
  score!: number;
  highScore: number = 0;

  constructor() {}

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key == 'ArrowDown' && this.offset !== -10) {
      this.offset = 10;
    } else if (event.key === 'ArrowUp' && this.offset !== 10) {
      this.offset = -10;
    } else if (event.key === 'ArrowRight' && this.offset !== -1) {
      this.offset = 1;
    } else if (event.key === 'ArrowLeft' && this.offset !== 1) {
      this.offset = -1;
    }
  }

  ngOnInit(): void {
    this.newGame();
    setInterval(() => this.makeMove(), 100);
  }

  move(dir: number): void {
    if (dir === 10 && this.offset !== -10) {
      this.offset = dir;
    } else if (dir === -10 && this.offset !== 10) {
      this.offset = dir;
    } else if (dir === 1 && this.offset !== -1) {
      this.offset = dir;
    } else if (dir === -1 && this.offset !== 1) {
      this.offset = dir;
    }
  }

  newGame() {
    this.tiles = new Array();
    this.snakeList = new Array();
    this.offset = 1;
    this.score = 0;
    for (let i = 1; i < 101; i++) {
      this.tiles.push({ id: i, color: 'white' });
    }
    this.snakeList = [32];
    this.apple = this.createApple();
  }

  makeMove(): void {
    for (let i = 1; i < this.snakeList.length - 1; i++) {
      if (this.snakeList[0] + this.offset === this.snakeList[i]) {
        if (this.score > this.highScore) {
          this.highScore = this.score;
        }
        this.newGame();
      }
    }
    if ((this.snakeList[0] + this.offset) % 10 === 0 && this.offset === 1) {
      this.snakeList.unshift(this.snakeList[0] - 9);
    } else if (
      (this.snakeList[0] - this.offset) % 10 === 1 &&
      this.offset === -1
    ) {
      this.snakeList.unshift(this.snakeList[0] + 9);
    } else if (this.snakeList[0] + this.offset < 0 && this.offset === -10) {
      this.snakeList.unshift(this.snakeList[0] + 90);
    } else if (this.snakeList[0] + this.offset > 99 && this.offset === 10) {
      this.snakeList.unshift(this.snakeList[0] - 90);
    } else {
      this.snakeList.unshift(this.snakeList[0] + this.offset);
    }

    this.snakeList.pop();

    if (this.snakeList[0] === this.apple) {
      this.score += 10;
      this.snakeList.push(this.apple);
      this.apple = this.createApple();
    }

    for (let i = 0; i < this.tiles.length; i++) {
      this.tiles[i].color = 'white';
      if (i === this.apple) {
        this.tiles[i].color = 'apple';
      }
      if (i === this.snakeList[0]) {
        this.tiles[i].color = 'head';
        continue;
      }
      if (this.snakeList.includes(i)) {
        this.tiles[i].color = 'tail';
      }
    }
  }

  createApple() {
    let randomId = Math.floor(Math.random() * 100);
    console.log(randomId);
    let i = 0;
    while (this.tiles[randomId].color !== 'white') {
      randomId = Math.floor(Math.random() * 100);
      i++;
      if (i > 1000) {
        randomId = -1;
        break;
      }
    }

    return randomId;
  }
}
