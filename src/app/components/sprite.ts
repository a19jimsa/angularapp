import { Component } from './component';

export class Sprite extends Component {
  override type: string = 'Sprite';
  image = new Image();
  flip: boolean;
  rotation: number;

  constructor(image: string) {
    super();
    this.image.src = image;
    this.flip = false;
    this.rotation = 0;
  }
}
