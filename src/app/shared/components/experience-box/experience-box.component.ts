import { Component, input, Input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';

@Component({
  selector: 'app-experience-box',
  imports: [MatCard, MatButton],
  templateUrl: './experience-box.component.html',
  styleUrl: './experience-box.component.css',
})
export class ExperienceBoxComponent {
  @Input() experienceList: string[] = new Array();
  public editable: boolean = true;

  ngOnInit() {
    this.experienceList.push('Hej');
  }

  addExperience() {
    this.experienceList.push('value');
  }

  removeExperience(index: number) {
    this.experienceList.splice(index, 1);
  }

  finish() {
    this.editable = !this.editable;
  }
}
