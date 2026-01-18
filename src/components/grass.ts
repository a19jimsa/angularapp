import { Component } from './component';

export class Grass extends Component {
  override type: string = 'Grass';
  maxGrassBuffer: number = 4;
  amountOfGrass: number = 4;
  positions: Float32Array = new Float32Array([
    500, 0, 500, 501, 0, 500, 502, 0, 500, 503, 0, 500,
  ]);
}
