import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sand-tile',
  templateUrl: './sand-tile.component.html',
  styleUrls: ['./sand-tile.component.css'],
})
export class SandTileComponent {
  @Input() value = new Input();

  getRandomColor() {
    // Generera slumpmässiga värden för r, g och b (0-255)
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    // Skapa en CSS-sträng för färgen
    return `rgb(${r},${g},${b})`;
  }
}
