import { Component } from '@angular/core';
import { Card } from '../card';

@Component({
  selector: 'app-memory',
  templateUrl: './memory.component.html',
  styleUrls: ['./memory.component.css'],
})
export class MemoryComponent {
  cards!: Card[];
  tempCards!: Card[];
  pair!: boolean;
  constructor() {}

  //Runs when init game from creating game
  ngOnInit(): void {
    this.newGame();
  }

  newGame() {
    this.pair = false;
    this.cards = new Array();
    this.tempCards = new Array();
    for (let i = 0; i < 64; i++) {
      this.cards.push({
        id: i,
        color: 'red',
        number: Math.floor(Math.random() * (10 - 1 + 1) + 1),
        active: false,
        match: false,
      });
    }
  }

  makeMove(idx: number) {
    if (this.pair) return;
    if (this.cards[idx].active) return;
    if (this.cards[idx].match) return;
    this.cards[idx].active = true;
    this.tempCards.push(this.cards[idx]);
    if (this.tempCards.length === 2) {
      this.pair = true;
      let id = this.tempCards[0].id;
      let id2 = this.tempCards[1].id;
      if (this.tempCards[0].number === this.tempCards[1].number) {
        this.cards[id].match = true;
        this.cards[id2].match = true;
        this.tempCards = [];
        this.pair = false;
      } else {
        setTimeout(() => {
          this.turnCards();
        }, 1000);
      }
    }
  }

  turnCards() {
    for (let i = 0; i < this.cards.length; i++) {
      if (!this.cards[i].match) {
        this.cards[i].active = false;
      }
    }
    this.pair = false;
    this.tempCards = [];
  }
}
