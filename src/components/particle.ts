import { Component } from './component';

export class Particle extends Component {
  override type: string = 'Particle';
  age: number;
  lifetime: number;
  ageOverLifetime: number;

  constructor(age: number, lifetime: number, ageOverLifetime: number) {
    super();
    this.age = age;
    this.lifetime = lifetime;
    this.ageOverLifetime = ageOverLifetime;
  }
}
