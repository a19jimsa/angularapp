import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms'; // Importera FormsModule

@Component({
  selector: 'app-keyframe-dialig',
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './keyframe-dialig.component.html',
  styleUrl: './keyframe-dialig.component.css',
})
export class KeyframeDialigComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
