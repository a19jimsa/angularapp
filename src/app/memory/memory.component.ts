import { Component } from '@angular/core';
import { Card } from '../card';

@Component({
    selector: 'app-memory',
    templateUrl: './memory.component.html',
    styleUrls: ['./memory.component.css'],
    standalone: false
})
export class MemoryComponent {
  cards!: Card[];
  tempCards!: Card[];
  pair!: boolean;
  clicks!: number;

  constructor() {}

  //Runs when init game from creating game
  ngOnInit(): void {
    this.newGame();
  }
  newGame() {
    const unicode: string[] = ['\u{2660}', '\u{2665}', '\u{2666}', '\u{2663}'];
    this.pair = false;
    this.cards = new Array();
    this.tempCards = new Array();
    this.clicks = 0;
    for (let i = 0; i < 64; i++) {
      let number = Math.floor(Math.random() * (unicode.length - 1) + 1);
      this.cards.push({
        id: i,
        color: 'red',
        hex: unicode[number],
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
      if (this.tempCards[0].hex === this.tempCards[1].hex) {
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
    this.clicks++;
    this.pair = false;
    this.tempCards = [];
  }
}
