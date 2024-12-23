import { Component } from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';

@Component({
  selector: 'app-filter-dialog',
  imports: [MatFormField, MatLabel],
  templateUrl: './filter-dialog.component.html',
  styleUrl: './filter-dialog.component.css',
})
export class FilterDialogComponent {}
