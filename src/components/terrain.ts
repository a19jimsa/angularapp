import { Component } from './component';

export class Terrain extends Component {
  override type: string = 'Terrain';
  heightMap = new Uint8Array(256 * 256 * 4);
}
