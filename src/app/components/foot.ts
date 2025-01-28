import { Component } from './component';

export class Foot extends Component {
  override type: string = 'Foot';
  value: number;
  constructor(value: number) {
    super();
    this.value = value;
  }
}
