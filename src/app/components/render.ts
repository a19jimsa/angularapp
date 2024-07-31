import { Component } from './component';

export class Render extends Component {
  override type: string = 'Render';
  color: string;

  constructor(color: string) {
    super();
    this.color = color;
  }
}
