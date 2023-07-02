import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KillersudokuComponent } from './killersudoku.component';

describe('KillersudokuComponent', () => {
  let component: KillersudokuComponent;
  let fixture: ComponentFixture<KillersudokuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KillersudokuComponent]
    });
    fixture = TestBed.createComponent(KillersudokuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
