import { Component } from './component';

export class Sprite2D extends Component {
  override type: string = 'Sprite2D';

  textureIndex: string;
  width: number;
  height: number;

  constructor(textureIndex: string, width: number, height: number) {
    super();
    this.textureIndex = textureIndex;
    this.width = width;
    this.height = height;
  }
}
