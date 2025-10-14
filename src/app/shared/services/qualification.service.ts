import { Injectable } from '@angular/core';

export type Qualification = {
  icon: string;
  text: string;
  stars: number;
};

@Injectable({
  providedIn: 'root',
})
export class QualificationService {
  list: Qualification[] = new Array();

  addToList(qualification: Qualification) {
    console.log(qualification);
    this.list.push(qualification);
  }

  remove(id: number) {
    this.list.splice(id, 1);
  }
}
