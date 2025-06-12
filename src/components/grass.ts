import { Component } from './component';

export class Grass extends Component {
  override type: string = 'Grass';
  maxGrassBuffer: number = 10000;
  amountOfGrass: number = 0;
  positions: number[] = new Array();
}
