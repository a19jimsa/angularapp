import { Component } from './component';

export class Grass extends Component {
  override type: string = 'Grass';
  maxGrassBuffer: number = 1;
  amountOfGrass: number = 0;
  positions: Float32Array = new Float32Array([
    0, 0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0,
  ]);
  slot: string;
  constructor(slot: string) {
    super();
    this.slot = slot;
  }
}
