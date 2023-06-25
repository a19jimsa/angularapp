import { Component, Input } from '@angular/core';
import { Sudoku } from '../sudoku';

@Component({
  selector: 'app-sudoku-number',
  templateUrl: './sudoku-number.component.html',
  styleUrls: ['./sudoku-number.component.css'],
})
export class SudokuNumberComponent {
  //My dumb component
  @Input() value!: Sudoku;
}
