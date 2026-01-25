import { Component } from './component';

export class Grass extends Component {
  override type: string = 'Grass';
  maxAmount: number = 100000;
  amount: number = 0;
  index: number = 0;
  meshId: string = 'grass';
  //Max grass per buffer * xyz
  positions: number[] = new Array(this.maxAmount * 3);
}
