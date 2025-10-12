import { Injectable } from '@angular/core';
import { Experience } from '../components/cv-maker/cv-maker.component';

@Injectable({
  providedIn: 'root',
})
export class ExperienceService {
  experienceList: Experience[] = new Array();

  addExperience(experience: Experience) {
    this.experienceList.push(experience);
  }

  removeAllExperiences() {
    this.experienceList = [];
  }
}
