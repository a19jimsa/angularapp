import { Component } from './component';

export class Heightmap extends Component {
  override type: string = 'Heightmap';
  coords: Uint8ClampedArray;
  constructor(coords: Uint8ClampedArray) {
    super();
    this.coords = coords;
  }
}
