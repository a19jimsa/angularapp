import { Component } from './component';

export class Tree extends Component {
  override type: string = 'Tree';
  maxAmount: number = 10000;
  amount: number = 0;
  stride: number = 5;
  //Max grass per buffer * xyz
  meshId = 'tree';
  materialId = 'tree';
  positionsId: string;
  index = 0;
  constructor(meshId: string, positionsId: string) {
    super();
    this.meshId = meshId;
    this.positionsId = positionsId;
  }
}
