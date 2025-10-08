import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualificationBoxComponent } from './qualification-box.component';

describe('QualificationBoxComponent', () => {
  let component: QualificationBoxComponent;
  let fixture: ComponentFixture<QualificationBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QualificationBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QualificationBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
