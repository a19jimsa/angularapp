import { Component } from './component';

export class Water extends Component {
  override type: string = 'Water';
  displacement: number = 0;
  constructor(displacement: number) {
    super();
    this.displacement = displacement;
  }
}
