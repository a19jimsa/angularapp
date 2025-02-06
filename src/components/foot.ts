import { Component } from './component';

export class Foot extends Component {
  override type: string = 'Foot';
  value: number;
  id: string;
  startValue: number = 0;
  startPositionY: number = 0;
  constructor(id: string) {
    super();
    this.value = 0;
    this.id = id;
  }
}
