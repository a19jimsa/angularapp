import { Vec } from 'src/app/vec';
import { Component } from './component';
import { Loader } from 'src/app/loader';

export type Sprite = {
  name: string;
  pivot: Vec;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  scaleX: number;
  scaleY: number;
};

export class Effect extends Component {
  override type: string = 'Effect';
  image: HTMLImageElement = new Image();
  position: Vec;
  sprites: Sprite[] = [];
  isAlive = true;

  constructor(image: string, position: Vec, effect: string) {
    super();
    this.image.src = image;
    this.position = position;
    for (const bone of Loader.getBones(effect)) {
      const sprite: Sprite = {
        name: bone.id,
        pivot: new Vec(bone.pivot.X, bone.pivot.Y),
        startX: bone.startX,
        startY: bone.startY,
        endX: bone.endX,
        endY: bone.endY,
        scaleX: bone.scale.X,
        scaleY: bone.scale.Y,
      };
      this.sprites.push(sprite);
    }
  }
}
