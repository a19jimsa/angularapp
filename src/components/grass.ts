import { Component } from './component';

export class Grass extends Component {
  override type: string = 'Grass';
  maxAmount: number = 100000;
  amount: number = 0;
  index: number = 0;
  meshId: string = 'grass';
  //Max grass per buffer * xyz
  positions: Float32Array = new Float32Array(this.maxAmount * 3);
}
