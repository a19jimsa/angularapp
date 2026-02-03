import { Component } from './component';

export class BatchRenderable extends Component {
  override type: string = 'BatchRenderable';
  slot: string;

  constructor(slot: string) {
    super();
    this.slot = slot;
  }
}
