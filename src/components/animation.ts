import { Component } from './component';

export class Animation extends Component {
  override type: string = 'Animation';
  animationPlayerName: string;

  constructor(name: string) {
    super();
      this.animationPlayerName = name;
  }
}
