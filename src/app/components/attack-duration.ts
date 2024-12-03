import { Component } from './component';

export class AttackDuration extends Component {
  override type: string = 'AttackDuration';
  cooldown: number;
  constructor(cooldown: number) {
    super();
    this.cooldown = cooldown;
  }
}
