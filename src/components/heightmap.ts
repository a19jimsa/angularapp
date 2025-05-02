import { Component } from './component';

export class Heightmap extends Component {
  override type: string = 'Heightmap';
  coords = new Float32Array();
  constructor(x: number, y: number) {
    super();
    this.coords = new Float32Array(x * y);
  }
}
