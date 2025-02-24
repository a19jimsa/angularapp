import { Bone } from './bone';
import { Component } from './component';
import { Entity } from '../app/entity';
import { Keyframe } from 'src/app/animation-creator/animation-creator.component';

export class Skeleton extends Component {
  override type = 'Skeleton';
  image = new Image();
  bones: Bone[] = [];
  flip: boolean = false;
  keyframes: Keyframe[];
  equipment: Keyframe[];
  startTime: number = 0;
  heldEntity: Entity | null;
  heldOffhandEntity: Entity | null;
  rotation: number;
  resource: string;
  animationDuration: number = 0;
  constructor(imageSrc: string, resource: string) {
    super();
    this.image.src = imageSrc;
    this.keyframes = [];
    this.equipment = [];
    this.heldEntity = null;
    this.heldOffhandEntity = null;
    this.rotation = 0;
    this.resource = resource;
  }
}
