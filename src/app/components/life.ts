import { Component } from './component';

export class Life extends Component {
  override type: string = 'Life';
  life: number;
  constructor(life: number) {
    super();
    this.life = life;
  }
}
