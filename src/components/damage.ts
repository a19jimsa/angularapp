import { Component } from './component';

export class Damage extends Component {
  override type = 'Damage';
  power: number;

  constructor(power: number) {
    super();
    this.power = power;
  }
}
