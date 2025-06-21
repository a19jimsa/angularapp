import { Component } from './component';

export class Terrain extends Component {
  override type: string = 'Terrain';
  coords: Uint8ClampedArray;
  constructor(coords: Uint8ClampedArray) {
    super();
    this.coords = coords;
  }
}
