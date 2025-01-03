import { Component, inject, input } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
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
import { CommonModule } from '@angular/common';
import { Keyframe } from '../animation-creator/animation-creator.component';

@Component({
  selector: 'app-filter-dialog',
  imports: [
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    CommonModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatButton,
  ],
  templateUrl: './filter-dialog.component.html',
  styleUrl: './filter-dialog.component.css',
})
export class FilterDialogComponent {
  data = inject<Keyframe[]>(MAT_DIALOG_DATA);
  filteredKeyframes: Keyframe[] = new Array();

  ngOnInit() {
    this.filteredKeyframes = this.data;
  }

  filterKeyframes($event: Event) {
    const inputValue = ($event.target as HTMLInputElement).value;
    this.filteredKeyframes = this.data.filter((e) =>
      e.name.includes(inputValue)
    );
  }
}
