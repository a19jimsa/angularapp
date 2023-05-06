import { Component, Input } from '@angular/core';
import { Player } from '../player';

@Component({
  selector: 'app-square',
  templateUrl: './square.component.html',
  styleUrls: ['./square.component.css'],
})
export class SquareComponent {
  //My dumb component
  @Input() value!: Player;
}
