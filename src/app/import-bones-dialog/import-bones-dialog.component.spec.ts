import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportBonesDialogComponent } from './import-bones-dialog.component';

describe('ImportBonesDialogComponent', () => {
  let component: ImportBonesDialogComponent;
  let fixture: ComponentFixture<ImportBonesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportBonesDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportBonesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
