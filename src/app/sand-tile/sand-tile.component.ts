import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sand-tile',
  templateUrl: './sand-tile.component.html',
  styleUrls: ['./sand-tile.component.css'],
})
export class SandTileComponent {
  @Input() value = new Input();
}
