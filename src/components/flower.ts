import { Component } from './component';

export class Flower extends Component {
  override type: string = 'Flower';
  flowerId: string;
  stride: number;
  maxAmount: number;
  amount: number;
  constructor(flowerId: string, maxAmount: number, stride: number) {
    super();
    this.flowerId = flowerId;
    //XYZ layer
    this.stride = stride;
    this.maxAmount = maxAmount;
    this.amount = 0;
  }
}
