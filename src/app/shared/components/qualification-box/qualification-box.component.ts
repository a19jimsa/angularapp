import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCard } from '@angular/material/card';

type Qualification = {
  icon: string;
  text: string;
  stars: number;
};

@Component({
  selector: 'app-qualification-box',
  imports: [MatCard, MatButtonModule],
  templateUrl: './qualification-box.component.html',
  styleUrl: './qualification-box.component.css',
})
export class QualificationBoxComponent {
  public qualifictions: Qualification[] = new Array();

  ngOnInit() {
    this.qualifictions.push({
      icon: 'bi bi-filetype-html',
      text: 'SAMPLE TEXT',
      stars: 5,
    });
  }

  addQualifiction() {
    this.qualifictions.push({
      icon: 'bi bi-filetype-html',
      text: 'Sample text',
      stars: 5,
    });
  }
}
