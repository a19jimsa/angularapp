import { Component } from './component';

export class ComboTimer extends Component {
  override type: string = 'ComboTimer';
  timer = 0;
  constructor(timer: number) {
    super();
    this.timer = timer;
  }
}
