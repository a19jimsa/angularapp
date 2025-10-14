import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatInput } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { QualificationService } from '../../services/qualification.service';

type Qualification = {
  icon: string;
  text: string;
  stars: number;
};

@Component({
  selector: 'app-qualification-box',
  imports: [
    MatCard,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
  ],
  templateUrl: './qualification-box.component.html',
  styleUrl: './qualification-box.component.css',
})
export class QualificationBoxComponent {
  public qualifictationService = inject(QualificationService);
  public icon = '';
  public text = '';
  public stars = 0;

  get qualifications() {
    return this.qualifictationService.list;
  }

  removeQualifiction(index: number) {
    this.qualifictationService.remove(index);
  }
}
