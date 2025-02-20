import { Component } from './component';

export class Life extends Component {
  override type: string = 'Life';
  maxHp: number;
  currentHp: number;
  constructor(maxHp: number) {
    super();
    this.maxHp = maxHp;
    this.currentHp = maxHp;
  }
}
