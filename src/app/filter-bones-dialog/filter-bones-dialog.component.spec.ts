import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterBonesDialogComponent } from './filter-bones-dialog.component';

describe('FilterBonesDialogComponent', () => {
  let component: FilterBonesDialogComponent;
  let fixture: ComponentFixture<FilterBonesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterBonesDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterBonesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
