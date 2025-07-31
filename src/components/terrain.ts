import { Component } from './component';

export class Terrain extends Component {
  override type: string = 'Terrain';
  tiling: number = 0;
  fogPower: number = 0;
  constructor() {
    super();
  }
}
