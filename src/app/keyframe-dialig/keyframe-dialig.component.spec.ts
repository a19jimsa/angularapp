import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyframeDialigComponent } from './keyframe-dialig.component';

describe('KeyframeDialigComponent', () => {
  let component: KeyframeDialigComponent;
  let fixture: ComponentFixture<KeyframeDialigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeyframeDialigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KeyframeDialigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
