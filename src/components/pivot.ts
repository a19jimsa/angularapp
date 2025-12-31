import { Component } from './component';

export class Pivot extends Component {
  override type: string = 'Pivot';
  vertices: Float32Array;
  colors: Float32Array;

  constructor() {
    super();
    this.vertices = new Float32Array([
      // X-axis
      0, 0, 0, 100, 0, 0,
      // Y-axis
      0, 0, 0, 0, 100, 0,
      // Z-axis
      0, 0, 0, 0, 0, 100,
    ]);

    this.colors = new Float32Array([
      // X-axis
      1, 0, 0, 1, 0, 0,
      // Y
      0, 1, 0, 0, 1, 0,
      // Z
      0, 0, 1, 0, 0, 1,
    ]);
  }
}
