import { Component } from './component';

export class Grass extends Component {
  override type: string = 'Grass';
  maxAmount: number = 100000;
  amount: number = 0;
  index: number = 0;
  meshId: string;
  materialId: string = 'grass';
  //Max grass per buffer * xyz
  grassId: string;
  constructor(meshId: string, grassId: string) {
    super();
    this.meshId = meshId;
    this.grassId = grassId;
  }
}
