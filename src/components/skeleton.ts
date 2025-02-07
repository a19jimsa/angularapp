import { Bone } from './bone';
import { State } from '../states/state';
import { Component } from './component';
import { OnGroundState } from '../states/on-ground-state';
import { Entity } from '../app/entity';

export class Skeleton extends Component {
  override type = 'Skeleton';
  image = new Image();
  bones: Bone[] = [];
  flip: boolean = false;
  state: State;
  equipment: State | null;
  startTime: number = 0;
  heldEntity: Entity | null;
  heldOffhandEntity: Entity | null;
  rotation: number;
  constructor(imageSrc: string, state: State) {
    super();
    this.image.src = imageSrc;
    this.state = state;
    this.equipment = null;
    this.heldEntity = null;
    this.heldOffhandEntity = null;
    this.rotation = 0;
  }
}
