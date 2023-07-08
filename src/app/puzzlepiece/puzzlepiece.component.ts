import { Component, Input } from '@angular/core';
import { Piece } from '../piece';

@Component({
  selector: 'app-puzzlepiece',
  templateUrl: './puzzlepiece.component.html',
  styleUrls: ['./puzzlepiece.component.css'],
})
export class PuzzlepieceComponent {
  //Dumb component
  @Input() value!: Piece;
}
