import { Component } from './component';

export class CooldownTimer extends Component {
  override type: string = 'CooldownTimer';
  timer = 0;
  constructor(timer: number) {
    super();
    this.timer = timer;
  }
}
