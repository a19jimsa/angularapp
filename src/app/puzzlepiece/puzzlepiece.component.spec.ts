import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuzzlepieceComponent } from './puzzlepiece.component';

describe('PuzzlepieceComponent', () => {
  let component: PuzzlepieceComponent;
  let fixture: ComponentFixture<PuzzlepieceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PuzzlepieceComponent]
    });
    fixture = TestBed.createComponent(PuzzlepieceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
