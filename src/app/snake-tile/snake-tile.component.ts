import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-snake-tile',
    templateUrl: './snake-tile.component.html',
    styleUrls: ['./snake-tile.component.css'],
    standalone: false
})
export class SnakeTileComponent {
  @Input() value = new Input();
}
