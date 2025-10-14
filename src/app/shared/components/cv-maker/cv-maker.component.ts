import { Component, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { MatCard, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { ExperienceBoxComponent } from '../experience-box/experience-box.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { QualificationBoxComponent } from '../qualification-box/qualification-box.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ExperienceService } from '../../services/experience.service';
import { EducationService } from '../../services/education.service';
import { EducationBoxComponent } from '../education-box/education-box.component';
import {
  Qualification,
  QualificationService,
} from '../../services/qualification.service';
import { Personal, PersonalService } from '../../services/personal.service';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { PbComponent } from '../pb/pb.component';

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
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    FormsModule,
    MatCheckboxModule,
    JsonPipe,
    EducationBoxComponent,
    QualificationBoxComponent,
    MatCardHeader,
    MatCardTitle,
    MatSlideToggle,
    PbComponent,
  ],
  templateUrl: './cv-maker.component.html',
  styleUrl: './cv-maker.component.css',
})
export class CvMakerComponent {
  private experienceService = inject(ExperienceService);
  private educationService = inject(EducationService);
  private qualificationService = inject(QualificationService);
  private personalService = inject(PersonalService);
  //INJECT FORMBUILDER AND ADD REACTIVE FORM
  private formBuilder = inject(FormBuilder);
  experienceForm = this.formBuilder.group({
    date: ['', Validators.required],
    companyName: ['', Validators.required],
    experienceList: this.formBuilder.array([this.formBuilder.control('')]),
  });

  public personalForm = this.formBuilder.group<Personal>({
    name: '',
    linkedin: '',
    phone: '',
    mail: '',
    homepage: '',
    githublink: '',
    exam: '',
  });

  education: boolean = false;

  isCv: boolean = true;
  showToolbox: boolean = true;

  public icon = '';
  public text = '';
  public stars = 0;

  get experiences() {
    return this.experienceForm.get('experienceList') as FormArray;
  }

  get personalInfo() {
    return this.personalService.personInfo;
  }

  addExperience() {
    this.experiences.push(this.formBuilder.control(''));
  }

  addQualification() {
    const qualification: Qualification = {
      icon: this.icon,
      text: this.text,
      stars: this.stars,
    };
    this.qualificationService.addToList(qualification);
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

  removeExperienceBox(id: number) {
    this.experiences.removeAt(id);
  }

  addPersonalInfo() {
    const personalInfo = this.personalForm.value as Personal;
    this.personalService.changeInfo(personalInfo);
  }
}
