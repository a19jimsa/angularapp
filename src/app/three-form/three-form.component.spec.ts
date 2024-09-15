import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeFormComponent } from './three-form.component';

describe('ThreeFormComponent', () => {
  let component: ThreeFormComponent;
  let fixture: ComponentFixture<ThreeFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ThreeFormComponent]
    });
    fixture = TestBed.createComponent(ThreeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
