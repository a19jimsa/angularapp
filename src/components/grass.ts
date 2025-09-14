import { Component } from './component';

export class Grass extends Component {
  override type: string = 'Grass';
  maxGrassBuffer: number = 100000 * 4;
  amountOfGrass: number = 0;
  positions = new Float32Array(100000 * 4);
  id: number = 0;
}
