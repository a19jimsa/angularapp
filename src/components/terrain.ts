import { Component } from './component';

export class Terrain extends Component {
  override type: string = 'Terrain';
  heightMap = new Uint8Array(64 * 64 * 4);
}
