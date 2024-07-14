import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FallingSandComponent } from './falling-sand.component';

describe('FallingSandComponent', () => {
  let component: FallingSandComponent;
  let fixture: ComponentFixture<FallingSandComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FallingSandComponent]
    });
    fixture = TestBed.createComponent(FallingSandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
