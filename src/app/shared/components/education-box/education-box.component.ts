import { Component, inject } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { EducationService } from '../../services/education.service';

@Component({
  selector: 'app-education-box',
  imports: [MatCard],
  templateUrl: './education-box.component.html',
  styleUrl: './education-box.component.css',
})
export class EducationBoxComponent {
  public service = inject(EducationService);

  get educations(){
    return this.service.educationList;
  }
}
