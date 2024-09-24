import { Component } from './component';

export class Health extends Component {
  override type: string = 'Health';
  health: number;

  constructor(health: number) {
    super();
    this.health = health;
  }
}
