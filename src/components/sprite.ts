import { ClipAnimation } from 'src/app/animation-creator/animation-creator.component';
import { Component } from './component';

export class Sprite extends Component {
  override type: string = 'Sprite';
  image = new Image();
  flip: boolean;
  clip: ClipAnimation;

  constructor(image: string) {
    super();
    this.image.src = image;
    this.flip = false;
    this.clip = {
      startX: 0,
      startY: 0,
      endX: this.image.width,
      endY: this.image.height,
    };
  }
}
