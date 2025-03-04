import { Component } from './component';

export class Combo extends Component {
  override type: string = 'Combo';
  comboCounter: number;
  comboTimer: number;
  constructor(counter: number) {
    super();
    this.comboCounter = counter;
    this.comboTimer = 3;
  }
}
