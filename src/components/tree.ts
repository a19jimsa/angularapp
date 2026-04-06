import { Component } from './component';

export class Tree extends Component {
  override type: string = 'Tree';
  textureId: number;
  width: number;
  height: number;

  constructor(width: number, height: number, textureId: number) {
    super();
    this.width = width;
    this.height = height;
    this.textureId = textureId;
  }
}
