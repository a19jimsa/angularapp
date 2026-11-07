import { Component } from './component';

export class Tree extends Component {
  override type: string = 'Tree';
  maxAmount: number = 10000;
  amount: number = 0;
  stride: number = 5;
  //Max grass per buffer * xyz
  meshId: string;
  materialId: string;
  textureId: string;
  positionsId: string;
  index = 0;
  constructor(
    maxAmount: number,
    meshId: string,
    materialId: string,
    positionsId: string,
    textureId: string,
  ) {
    super();
    this.maxAmount = maxAmount;
    this.meshId = meshId;
    this.positionsId = positionsId;
    this.materialId = materialId;
    this.textureId = textureId;
  }
}
