import { Component } from '@angular/core';

@Component({
    selector: 'app-falling-sand',
    templateUrl: './falling-sand.component.html',
    styleUrls: ['./falling-sand.component.css'],
    standalone: false
})
export class FallingSandComponent {
  tiles!: number[];
  ngOnInit() {
    this.tiles = new Array(900);
    this.tiles.fill(0);
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
  }

  swap(i: number, j: number) {
    let temp = this.tiles[i];
    this.tiles[i] = this.tiles[j];
    this.tiles[j] = temp;
  }

  getRandomColor() {
    // Generera slumpmässiga värden för r, g och b (0-255)
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    // Skapa en CSS-sträng för färgen
    return `rgb(${r},${g},${b})`;
  }
}
