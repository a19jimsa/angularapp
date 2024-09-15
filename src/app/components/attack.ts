import { Component } from './component';

export class Attack extends Component {
  override type = 'Attack';
  damage: number;
  speed: number;

  constructor(damage: number, speed: number) {
    super();
    this.damage = damage;
    this.speed = speed;
  }
}
