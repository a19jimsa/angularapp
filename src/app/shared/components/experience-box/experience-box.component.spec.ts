import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperienceBoxComponent } from './experience-box.component';

describe('ExperienceBoxComponent', () => {
  let component: ExperienceBoxComponent;
  let fixture: ComponentFixture<ExperienceBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExperienceBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExperienceBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
