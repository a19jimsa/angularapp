import { Component } from './component';

export class Terrain extends Component {
  override type: string = 'Terrain';
  id: number;
  coords: Uint8ClampedArray;
  constructor(id: number, coords: Uint8ClampedArray) {
    super();
    this.id = id;
    this.coords = coords;
  }
}
