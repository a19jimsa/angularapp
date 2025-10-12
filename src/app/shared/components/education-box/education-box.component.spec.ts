import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationBoxComponent } from './education-box.component';

describe('EducationBoxComponent', () => {
  let component: EducationBoxComponent;
  let fixture: ComponentFixture<EducationBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EducationBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EducationBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
