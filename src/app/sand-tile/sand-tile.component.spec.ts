import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SandTileComponent } from './sand-tile.component';

describe('SandTileComponent', () => {
  let component: SandTileComponent;
  let fixture: ComponentFixture<SandTileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SandTileComponent]
    });
    fixture = TestBed.createComponent(SandTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
