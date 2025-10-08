import { Component } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { ExperienceBoxComponent } from '../experience-box/experience-box.component';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { QualificationBoxComponent } from "../qualification-box/qualification-box.component";

@Component({
  selector: 'app-cv-maker',
  imports: [ExperienceBoxComponent, MatCard, MatButtonModule, QualificationBoxComponent],
  templateUrl: './cv-maker.component.html',
  styleUrl: './cv-maker.component.css',
})
export class CvMakerComponent {
  public experienceBoxes: number[] = new Array();
  public educationBoxes: number[] = new Array();

  addExperience() {
    this.educationBoxes.push(1);
  }

  addEducation() {
    this.experienceBoxes.push(1);
  }
}
