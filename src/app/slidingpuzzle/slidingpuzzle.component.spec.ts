import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlidingpuzzleComponent } from './slidingpuzzle.component';

describe('SlidingpuzzleComponent', () => {
  let component: SlidingpuzzleComponent;
  let fixture: ComponentFixture<SlidingpuzzleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SlidingpuzzleComponent]
    });
    fixture = TestBed.createComponent(SlidingpuzzleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
