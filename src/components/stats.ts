import { Component } from './component';

export class Stats extends Component {
  override type: string = 'Stats';
  damage: number;
  constructor(damage: number) {
    super();
    this.damage = damage;
  }
}
