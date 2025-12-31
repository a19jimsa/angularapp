import { Component } from './component';

export class BatchRenderable extends Component {
  override type: string = 'BatchRenderable';
  width: number;
  height: number;
  texture: string;

  constructor(width: number, height: number, texture: string) {
    super();
    this.width = width;
    this.height = height;
    this.texture = texture;
  }
}
