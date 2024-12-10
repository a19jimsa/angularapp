import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Bone } from '../components/bone';
import { Vec } from '../vec';

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
export class BoneDialogComponent {
  bone: Bone;
  constructor() {
    this.bone = new Bone(
      '',
      null,
      new Vec(0, 0),
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      new Vec(0, 0)
    );
  }
}
