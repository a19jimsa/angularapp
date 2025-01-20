import { Vec } from '../vec';
import { Component } from './component';

export class Weapon extends Component {
  override type = 'Weapon';
  parentId: string | null;
  image: HTMLImageElement = new Image();
  position: Vec;
  offset: Vec;
  pivot: Vec;
  rotation: number;
  order: number;

  constructor(parentId: string | null, image: string, pivot: Vec) {
    super();
    this.parentId = parentId;
    this.image.src = image;
    this.position = new Vec(0, 0);
    this.offset = new Vec(0, 0);
    this.pivot = pivot;
    this.rotation = 0;
    this.order = 0;
  }
}
