import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Sudoku } from '../sudoku';

@Component({
    selector: 'app-sudokumenu',
    templateUrl: './sudokumenu.component.html',
    styleUrls: ['./sudokumenu.component.css'],
    standalone: false
})
export class SudokumenuComponent implements OnInit {
  @Input() sudokuNumbers!: Sudoku[];
  @Output() newItemEvent = new EventEmitter<string>();
  values!: Sudoku[];
  constructor() {}

  ngOnInit(): void {
    this.values = new Array();
    console.log('init');
    this.newMenu();
  }
  addNewItem(value: string) {
    this.newItemEvent.emit(value);
  }

  newMenu(): void {
    this.values = new Array();
    for (let i = 9; i > 0; i--) {
      this.values.push({
        value: '' + i,
        active: false,
        hidden: false,
        locked: false,
        block: 'none',
        blockValue: 0,
      });
    }
  }

  ngOnChanges(): void {
    if (this.values !== undefined) {
      this.reset();
    }
    for (let i = 0; i < this.sudokuNumbers.length; i++) {
      let nr = this.values.findIndex(
        (x) => x.value === this.sudokuNumbers[i].value
      );
      if (nr === -1) continue;
      this.values[nr].hidden = true;
    }
  }

  reset() {
    this.values.forEach((x) => (x.hidden = false));
  }
}
