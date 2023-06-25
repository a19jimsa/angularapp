import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SudokuNumberComponent } from './sudoku-number.component';

describe('SudokuNumberComponent', () => {
  let component: SudokuNumberComponent;
  let fixture: ComponentFixture<SudokuNumberComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SudokuNumberComponent]
    });
    fixture = TestBed.createComponent(SudokuNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
