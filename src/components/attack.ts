import { Component } from './component';

export class Attack extends Component {
  override type = 'Attack';
  timer: number;

  constructor() {
    super();
    this.timer = 0;
  }
}
