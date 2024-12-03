import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimationCreatorComponent } from './animation-creator.component';

describe('AnimationCreatorComponent', () => {
  let component: AnimationCreatorComponent;
  let fixture: ComponentFixture<AnimationCreatorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AnimationCreatorComponent]
    });
    fixture = TestBed.createComponent(AnimationCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
