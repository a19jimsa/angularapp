import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidescrollerGameComponent } from './sidescroller-game.component';

describe('SidescrollerGameComponent', () => {
  let component: SidescrollerGameComponent;
  let fixture: ComponentFixture<SidescrollerGameComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SidescrollerGameComponent]
    });
    fixture = TestBed.createComponent(SidescrollerGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
