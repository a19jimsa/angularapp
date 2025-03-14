import { Bone } from './bone';
import { Component } from './component';
import { Entity } from '../app/entity';
import {
  ClipAnimation,
  Keyframe,
} from 'src/app/animation-creator/animation-creator.component';
import { Vec } from 'src/app/vec';

export type Snapshot = {
  rotation: number;
  scale: Vec;
  clip: ClipAnimation;
};

export class Skeleton extends Component {
  override type = 'Skeleton';
  image = new Image();
  bones: Bone[] = [];
  flip: boolean = false;
  blend: boolean = false;
  keyframes: Keyframe[];
  equipment: Keyframe[];
  startTime: number = 0;
  heldEntity: Entity | null;
  heldOffhandEntity: Entity | null;
  snapShot: Record<string, Snapshot> | null = null;
  rotation: number;
  resource: string;
  animationDuration: number = 0;
  elapsedTime: number = 0;
  lowestPoint = 0;
  loop: boolean = false;
  blendTime: number = 20;
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
