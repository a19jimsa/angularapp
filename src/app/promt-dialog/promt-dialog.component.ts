import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
} from '@angular/material/dialog';

@Component({
  selector: 'app-promt-dialog',
  imports: [MatDialogActions, MatDialogContent, MatButton, MatDialogClose],
  templateUrl: './promt-dialog.component.html',
  styleUrl: './promt-dialog.component.css',
})
export class PromtDialogComponent {}
