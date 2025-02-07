import { Vec } from '../app/vec';
import { Component } from './component';

export class Weapon extends Component {
  override type = 'Weapon';
  parentId: string | null;
  image: HTMLImageElement = new Image();
  scale: Vec;
  pivot: Vec;
  rotation: number;
  order: number;
  flip: boolean;

  constructor(parentId: string | null, image: string, pivot: Vec) {
    super();
    this.parentId = parentId;
    this.image.src = image;
    this.scale = new Vec(0, 0);
    this.pivot = pivot;
    this.rotation = 0;
    this.order = 0;
    this.flip = false;
  }
}
