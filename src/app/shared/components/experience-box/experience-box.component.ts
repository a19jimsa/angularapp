import { Component, inject } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { ExperienceService } from '../../services/experience.service';

@Component({
  selector: 'app-experience-box',
  imports: [MatCard],
  templateUrl: './experience-box.component.html',
  styleUrl: './experience-box.component.css',
})
export class ExperienceBoxComponent {
  private service = inject(ExperienceService);

  get experiences() {
    return this.service.experienceList;
  }
}
