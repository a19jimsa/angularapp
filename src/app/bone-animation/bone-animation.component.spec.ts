import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoneAnimationComponent } from './bone-animation.component';

describe('BoneAnimationComponent', () => {
  let component: BoneAnimationComponent;
  let fixture: ComponentFixture<BoneAnimationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BoneAnimationComponent]
    });
    fixture = TestBed.createComponent(BoneAnimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
