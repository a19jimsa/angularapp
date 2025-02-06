import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogTitle,
  MatDialogContent,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Bone } from '../../components/bone';

@Component({
  selector: 'app-bone-dialog',
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
  templateUrl: './bone-dialog.component.html',
  styleUrl: './bone-dialog.component.css',
})
export class BoneDialogComponent implements OnInit {
  readonly data = inject<Bone>(MAT_DIALOG_DATA);

  ngOnInit(): void {
    console.log(this.data);
  }
}
