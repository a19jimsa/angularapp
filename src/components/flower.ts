import { Component } from './component';

export class Flower extends Component {
  override type: string = 'Flower';
  positions: Float32Array;
  maxAmount: number;
  amount: number;
  constructor(maxAmount: number) {
    super();
    //XYZ layer
    this.positions = new Float32Array(maxAmount * 3);
    this.maxAmount = maxAmount;
    this.amount = 0;
  }
}
