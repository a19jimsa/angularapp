import { Component } from './component';

export class BatchRenderable extends Component {
  override type: string = 'BatchRenderable';
  id: number;

  constructor(id: number) {
    super();
    this.id = id;
  }
}
