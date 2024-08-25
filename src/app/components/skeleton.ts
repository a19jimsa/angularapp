import { StateMachine } from '../state-machine';
import { Bone } from './bone';
import { Component } from './component';

export class Skeleton extends Component {
  override type = 'Skeleton';
  image = new Image();
  bones: Bone[];
  stateMachine: StateMachine = new StateMachine();

  constructor(bones: Bone[] = [], imageSrc: string) {
    super();
    this.bones = bones;
    this.image.src = imageSrc;
  }
}
