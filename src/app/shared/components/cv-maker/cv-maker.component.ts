import { Component, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { MatCard } from '@angular/material/card';
import { ExperienceBoxComponent } from '../experience-box/experience-box.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { QualificationBoxComponent } from '../qualification-box/qualification-box.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  FormArray,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ExperienceService } from '../../services/experience.service';
import { EducationService } from '../../services/education.service';
import { EducationBoxComponent } from '../education-box/education-box.component';

export type Experience = {
  date: string;
  companyName: string;
  experienceList: string[];
};

@Component({
  selector: 'app-cv-maker',
  imports: [
    ExperienceBoxComponent,
    MatCard,
    MatButtonModule,
    QualificationBoxComponent,
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    FormsModule,
    MatCheckboxModule,
    JsonPipe,
    EducationBoxComponent,
  ],
  templateUrl: './cv-maker.component.html',
  styleUrl: './cv-maker.component.css',
})
export class CvMakerComponent {
  public experienceBoxes: number[] = new Array();
  public educationBoxes: number[] = new Array();
  private experienceService = inject(ExperienceService);
  private educationService = inject(EducationService);
  //INJECT FORMBUILDER AND ADD REACTIVE FORM
  private formBuilder = inject(FormBuilder);
  experienceForm = this.formBuilder.group({
    date: ['', Validators.required],
    companyName: ['', Validators.required],
    experienceList: this.formBuilder.array([this.formBuilder.control('')]),
  });

  education: boolean = false;

  get experiences() {
    return this.experienceForm.get('experienceList') as FormArray;
  }

  addExperience() {
    this.experiences.push(this.formBuilder.control(''));
  }

  onSubmit() {
    const experienceItem = this.experienceForm.value as Experience;
    console.log(experienceItem);
    if (this.education) {
      this.educationService.addEducation(experienceItem);
    } else {
      this.experienceService.addExperience(experienceItem);
    }
    this.experienceForm.reset();
  }
}
