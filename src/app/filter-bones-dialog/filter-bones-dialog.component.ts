import { Component, inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { Bone } from '../../components/bone';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-filter-bones-dialog',
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
    MatCheckboxModule,
    ReactiveFormsModule,
  ],
  templateUrl: './filter-bones-dialog.component.html',
  styleUrl: './filter-bones-dialog.component.css',
})
export class FilterBonesDialogComponent {
  data = inject<Bone[]>(MAT_DIALOG_DATA);
  selectedIds = new Set<string>();
  filtered: Bone[] = new Array();

  toggleSelection(id: string, checked: boolean) {
    if (checked) {
      this.selectedIds.add(id);
    } else {
      this.selectedIds.delete(id);
    }
    this.filterData();
  }

  filterData() {
    this.filtered = this.data.filter((item) => this.selectedIds.has(item.id));
    console.log(this.filtered); // Endast de valda objekten
  }
}
