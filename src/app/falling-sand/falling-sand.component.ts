import { Component } from '@angular/core';

@Component({
  selector: 'app-falling-sand',
  templateUrl: './falling-sand.component.html',
  styleUrls: ['./falling-sand.component.css'],
})
export class FallingSandComponent {
  tiles!: number[];
  ngOnInit() {
    this.tiles = new Array(900);
    this.tiles.fill(0);
    console.log(this.tiles);
    setInterval(() => this.makeMove(), 10);
  }

  makeMove() {
    let i = 0;
    const updateColumn = () => {
      if (i >= 30) return; // Avsluta om alla kolumner har uppdaterats
      for (let j = 0; j < 30; j++) {
        let index = i + j * 30;
        if (this.tiles[index - 30] === 0) {
          this.swap(index, index - 30);
        } else if (this.tiles[index - 31] === 0) {
          this.swap(index, index - 31);
        } else if (this.tiles[index - 29] === 0) {
          this.swap(index, index - 29);
        }
      }

      i++;
      setTimeout(updateColumn, 100); // Kör nästa kolumn efter 100 ms
    };

    updateColumn();
  }

  putSand(position: number) {
    this.tiles[position] = 1;
    console.log(position);
    if (this.tiles[position + 30] === 0) {
      //this.swap(i, i + 30);
      console.log('hit');
    }
  }

  swap(i: number, j: number) {
    let temp = this.tiles[i];
    this.tiles[i] = this.tiles[j];
    this.tiles[j] = temp;
  }
}
