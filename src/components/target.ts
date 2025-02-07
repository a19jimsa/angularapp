import { Entity } from 'src/app/entity';
import { Component } from './component';

export class Target extends Component {
  override type: string = 'Target';
  target: Entity;

  constructor() {
    super();
    this.target = 0;
  }
}
