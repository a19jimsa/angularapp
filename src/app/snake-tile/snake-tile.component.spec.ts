import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnakeTileComponent } from './snake-tile.component';

describe('SnakeTileComponent', () => {
  let component: SnakeTileComponent;
  let fixture: ComponentFixture<SnakeTileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SnakeTileComponent]
    });
    fixture = TestBed.createComponent(SnakeTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
