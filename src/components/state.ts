import { Component } from './component';

export enum States {
  Idle = 'idle',
  Running = 'running',
  Attacking = 'attacking',
  Flying = 'flying',
  Bow = 'bow',
  Jump = 'jump',
  JumpAttack = 'jumpattack',
  Damage = 'damage',
  Dead = 'dead',
  No = 'noState',
  Stagger = 'stagger',
}

export class State extends Component {
  override type: string = 'State';
  resource: string;
  state: States = States.Idle;

  constructor(resource: string) {
    super();
    this.resource = resource;
  }
}
