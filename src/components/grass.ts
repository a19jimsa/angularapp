import { Component } from './component';

export class Grass extends Component {
  override type: string = 'Grass';
  maxAmount: number;
  amount: number = 0;
  index: number = 0;
  meshId: string;
  materialId: string = 'grass';
  //Max grass per buffer * xyz
  grassPositionId: string;
  constructor(maxAmount: number, meshId: string, grassPositionId: string) {
    super();
    this.maxAmount = maxAmount;
    this.meshId = meshId;
    this.grassPositionId = grassPositionId;
  }
}
