import { Component } from './component';

export class Tree extends Component {
  override type: string = 'Tree';
  maxAmount: number = 100000;
  amount: number = 0;
  //Max grass per buffer * xyz
  positions: Float32Array = new Float32Array(this.maxAmount * 5);
  meshId = 'tree';
  index = 0;
  constructor(meshId: string) {
    super();
    this.meshId = meshId;
  }
}
