import { Component } from './component';

export class Tree extends Component {
  override type: string = 'Tree';
  maxAmount: number = 1000000;
  amount: number = 0;
  //Max grass per buffer * xyz
  positions: Float32Array = new Float32Array(this.maxAmount * 5);
  meshId = 'tree';
  constructor(meshId: string) {
    super();
    this.meshId = meshId;
  }
}
