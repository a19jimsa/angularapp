import { Component } from './component';

export class Sprite extends Component {
  override type: string = 'Sprite';
  image = new Image();
  frameCounter: number;
  dw: number;
  dh: number;
  xEnd: number;
  yEnd: number;

  constructor(
    image: string,
    frameCounter: number,
    dw: number,
    dh: number,
    xEnd: number,
    yEnd: number
  ) {
    super();
    this.image.src = image;
    this.frameCounter = frameCounter;
    this.dw = dw;
    this.dh = dh;
    this.xEnd = xEnd;
    this.yEnd = yEnd;
  }
}
