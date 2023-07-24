import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-snake-tile',
  templateUrl: './snake-tile.component.html',
  styleUrls: ['./snake-tile.component.css'],
})
export class SnakeTileComponent {
  @Input() value = new Input();
}
