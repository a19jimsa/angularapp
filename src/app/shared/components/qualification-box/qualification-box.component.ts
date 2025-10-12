import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatInput } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

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
    MatInput,
    MatFormField,
    MatFormFieldModule,
    MatIconModule,
  ],
  templateUrl: './qualification-box.component.html',
  styleUrl: './qualification-box.component.css',
})
export class QualificationBoxComponent {
  public qualifictions: Qualification[] = new Array();
  public icon = '';
  public text = '';
  public stars = 0;

  ngOnInit() {}

  addQualifiction() {
    this.qualifictions.push({
      icon: this.icon,
      text: this.text,
      stars: this.stars,
    });
  }
  removeQualifiction(index: number) {
    this.qualifictions.splice(index, 1);
  }
}
