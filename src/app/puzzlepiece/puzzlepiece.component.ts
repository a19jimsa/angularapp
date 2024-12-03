import { Component, Input } from '@angular/core';
import { Piece } from '../piece';

@Component({
    selector: 'app-puzzlepiece',
    templateUrl: './puzzlepiece.component.html',
    styleUrls: ['./puzzlepiece.component.css'],
    standalone: false
})
export class PuzzlepieceComponent {
  //Dumb component
  @Input() value!: Piece;
}
