import { Component } from './component';

export class Grass extends Component {
  override type: string = 'Grass';
  maxGrassBuffer: number = 1000000;
  amountOfGrass: number = 0;
  positions = new Float32Array(1000000 * 3);
}
