import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SudokumenuComponent } from './sudokumenu.component';

describe('SudokumenuComponent', () => {
  let component: SudokumenuComponent;
  let fixture: ComponentFixture<SudokumenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SudokumenuComponent]
    });
    fixture = TestBed.createComponent(SudokumenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
