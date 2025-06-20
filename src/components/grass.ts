import { Component } from './component';

export class Grass extends Component {
  override type: string = 'Grass';
  maxGrassBuffer: number = 100000;
  amountOfGrass: number = 0;
  positions: number[] = new Array();
}
