import { Component } from './component';

export class BatchRenderable extends Component {
  override type: string = 'BatchRenderable';
  width: number;
  height: number;
  textureSlot: number;

  constructor(width: number, height: number, textureSlot: number) {
    super();
    this.width = width;
    this.height = height;
    this.textureSlot = textureSlot;
  }
}
