import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrushImageComponent } from './brush-image.component';

describe('BrushImageComponent', () => {
  let component: BrushImageComponent;
  let fixture: ComponentFixture<BrushImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrushImageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrushImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
