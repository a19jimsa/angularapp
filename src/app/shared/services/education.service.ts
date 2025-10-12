import { Injectable } from '@angular/core';
import { Experience } from '../components/cv-maker/cv-maker.component';

@Injectable({
  providedIn: 'root',
})
export class EducationService {
  educationList: Experience[] = new Array();

  addEducation(experience: Experience) {
    this.educationList.push(experience);
  }

  removeAllEducations() {
    this.educationList = [];
  }
}
