import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportKeyframeDialogComponent } from './import-keyframe-dialog.component';

describe('ImportKeyframeDialogComponent', () => {
  let component: ImportKeyframeDialogComponent;
  let fixture: ComponentFixture<ImportKeyframeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportKeyframeDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportKeyframeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
