import { Component } from './component';

export class Terrain extends Component {
  override type: string = 'Terrain';
  tiling: number = 0.01;
  fogPower: number = 0;
  constructor() {
    super();
  }
}
