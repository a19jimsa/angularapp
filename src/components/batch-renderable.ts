import { Component } from './component';

export class BatchRenderable extends Component {
  override type: string = 'BatchRenderable';
  width: number;
  height: number;
  slot: string;

  constructor(width: number, height: number, slot: string) {
    super();
    this.slot = slot;
    this.width = width;
    this.height = height;
  }
}
