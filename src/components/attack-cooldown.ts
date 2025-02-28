import { Component } from './component';

export class AttackCooldown extends Component {
  override type: string = 'AttackCooldown';
  timer = 0;
  constructor(timer: number) {
    super();
    this.timer = timer;
  }
}
