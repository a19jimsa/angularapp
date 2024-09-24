import { Bone } from './bone';
import { StateMachine } from '../state-machine';
import { Component } from './component';
import { Joint } from './joint';

export class Skeleton extends Component {
  override type = 'Skeleton';
  image = new Image();
  joints: Joint[] = [];
  bones: Bone[] = [];
  flip: boolean = false;
  animationLength: number;
  stateMachine: StateMachine = new StateMachine();
  frames: number;
  constructor(imageSrc: string) {
    super();
    this.image.src = imageSrc;
    this.frames = 0;
    this.animationLength = 0;
  }
}
