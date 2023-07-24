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

  constructor() {}

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key == 'ArrowDown') {
      this.offset = 10;
    } else if (event.key === 'ArrowUp') {
      this.offset = -10;
    } else if (event.key === 'ArrowRight') {
      this.offset = 1;
    } else if (event.key === 'ArrowLeft') {
      this.offset = -1;
    }
  }

  ngOnInit(): void {
    this.tiles = new Array();
    this.snakeList = new Array();
    this.offset = 1;
    this.apple = this.createApple();
    this.newGame();
    setInterval(() => this.makeMove(), 100);
  }

  newGame() {
    for (let i = 0; i < 100; i++) {
      this.tiles.push({ id: i, color: 'white' });
    }
    this.snakeList = [16];
  }

  makeMove(): void {
    this.snakeList.unshift(this.snakeList[0] + this.offset);
    this.snakeList.pop();

    for (let i = 0; i < this.tiles.length; i++) {
      this.tiles[i].color = 'white';
      if (i === this.apple) {
        this.tiles[i].color = 'apple';
      }
      if (this.snakeList.includes(this.tiles[i].id)) {
        this.tiles[i].color = 'tail';
      }
      if (this.snakeList[0] === this.apple) {
        console.log('added');
        this.snakeList.push(i);
        this.apple = this.createApple();
        break;
      }
    }
  }

  createApple() {
    let randomId = Math.floor(Math.random() * 100);
    return randomId;
  }
}
