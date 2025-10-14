import { Injectable } from '@angular/core';

export type Personal = {
  name: string;
  linkedin: string;
  phone: string;
  mail: string;
  homepage: string;
  githublink: string;
  exam: string;
};

@Injectable({
  providedIn: 'root',
})
export class PersonalService {
  personInfo: Personal = {
    name: '',
    linkedin: '',
    phone: '',
    mail: '',
    homepage: '',
    githublink: '',
    exam: '',
  };

  changeInfo(qualification: Personal) {
    this.personInfo = qualification;
  }
}
