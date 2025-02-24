import { Component } from './component';

export class Damage extends Component {
  override type = 'Damage';
  timer = 0;

  constructor(duration: number) {
    super();
    this.timer = duration;
  }
}
