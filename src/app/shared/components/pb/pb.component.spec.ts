import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PbComponent } from './pb.component';

describe('PbComponent', () => {
  let component: PbComponent;
  let fixture: ComponentFixture<PbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PbComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
