import { Component, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  MatDialogContent,
  MatDialogActions,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogClose,
} from '@angular/material/dialog';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';

export interface DialogData {
  quads: number;
  width: number;
  height: number;
  name: string;
}

@Component({
  selector: 'app-add-new-mesh-dialog',
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatFormField,
    MatLabel,
    FormsModule,
    MatButton,
    MatInput,
    MatDialogClose,
  ],
  templateUrl: './add-new-mesh-dialog.component.html',
  styleUrl: './add-new-mesh-dialog.component.css',
})
export class AddNewMeshDialogComponent {
  readonly dialogRef = inject(MatDialogRef<AddNewMeshDialogComponent>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  readonly info = model(this.data);

  onNoClick(): void {
    this.dialogRef.close();
  }


}
