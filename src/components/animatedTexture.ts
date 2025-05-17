import { Component } from './component';

export class AnimatedTexture extends Component {
  override type: string = 'AnimatedTexture';
  speed: number;

  constructor(speed: number) {
    super();
    this.speed = speed;
  }
}
