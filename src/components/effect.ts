import { Vec } from 'src/app/vec';
import { Component } from './component';
import { Loader } from 'src/app/loader';

export type Sprite = {
  rotation: number;
  name: string;
  position: Vec;
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
  effectType: string;

  constructor(image: string, position: Vec, effectType: string) {
    super();
    this.image.src = image;
    this.position = position;
    for (const bone of Loader.getBones(effectType)) {
      const sprite: Sprite = {
        name: bone.id,
        position: new Vec(bone.position.X, bone.position.Y),
        pivot: new Vec(bone.pivot.X, bone.pivot.Y),
        startX: bone.startX,
        startY: bone.startY,
        endX: bone.endX,
        endY: bone.endY,
        scaleX: bone.scale.X,
        scaleY: bone.scale.Y,
        rotation: bone.rotation,
      };
      this.sprites.push(sprite);
    }
    this.effectType = effectType;
  }
}
