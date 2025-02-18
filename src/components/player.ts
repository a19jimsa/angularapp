import { StateMachine } from 'src/states/state-machine';
import { Component } from './component';
import { OnGroundState } from 'src/states/on-ground-state';

export class Player extends Component {
  override type: string = 'Player';
  state: StateMachine;
  constructor() {
    super();
    this.state = new OnGroundState();
  }
}
