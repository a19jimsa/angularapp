import { Bone } from './bone';
import { State } from '../States/state';
import { Component } from './component';
import { Vec } from '../vec';
import { OnGroundState } from '../States/on-ground-state';
import { Entity } from '../entity';

export class Skeleton extends Component {
  override type = 'Skeleton';
  image = new Image();
  bones: Bone[] = [];
  flip: boolean = false;
  state: State;
  startTime: number = 0;
  heldEntity: Entity | null;
  heldOffhandEntity: Entity | null;
  constructor(imageSrc: string) {
    super();
    this.image.src = imageSrc;
    this.state = new OnGroundState();
    this.heldEntity = null;
    this.heldOffhandEntity = null;
  }
}
