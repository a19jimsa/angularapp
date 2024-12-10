import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoneDialogComponent } from './bone-dialog.component';

describe('BoneDialogComponent', () => {
  let component: BoneDialogComponent;
  let fixture: ComponentFixture<BoneDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoneDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoneDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
