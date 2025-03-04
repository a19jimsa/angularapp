import { Component } from './component';

export class Ragdoll extends Component {
  override type: string = 'Ragdoll';
  timer: number;
  constructor(timer: number) {
    super();
    this.timer = timer;
  }
}
