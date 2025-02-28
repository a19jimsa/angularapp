import { Component } from './component';

export class Cooldown extends Component {
  override type: string = 'Cooldown';
  timer: number;
  constructor(timer: number) {
    super();
    this.timer = timer;
  }
}
