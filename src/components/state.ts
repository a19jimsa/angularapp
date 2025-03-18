import { Component } from './component';

export enum States {
  Idle = 'idle',
  Running = 'running',
  Attacking = 'attacking',
  SmashAttack = 'smashattack',
  Flying = 'flying',
  Bow = 'bow',
  Jump = 'jump',
  JumpAttack = 'jump-attack',
  Damage = 'damage',
  Death = 'death',
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
