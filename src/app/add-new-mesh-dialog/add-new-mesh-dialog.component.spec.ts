import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewMeshDialogComponent } from './add-new-mesh-dialog.component';

describe('AddNewMeshDialogComponent', () => {
  let component: AddNewMeshDialogComponent;
  let fixture: ComponentFixture<AddNewMeshDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewMeshDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewMeshDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
