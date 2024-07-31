import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurlingComponent } from './curling.component';

describe('CurlingComponent', () => {
  let component: CurlingComponent;
  let fixture: ComponentFixture<CurlingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CurlingComponent]
    });
    fixture = TestBed.createComponent(CurlingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
