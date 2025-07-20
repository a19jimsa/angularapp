import { Component, inject } from '@angular/core';
import {
  MatDialogRef,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';

@Component({
  selector: 'app-create-entity-dialog',
  imports: [MatDialogContent, MatDialogActions],
  templateUrl: './create-entity-dialog.component.html',
  styleUrl: './create-entity-dialog.component.css',
})
export class CreateEntityDialogComponent {
  readonly dialogRef = inject(MatDialogRef<CreateEntityDialogComponent>);
}
