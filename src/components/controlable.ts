import { Vec } from '../app/vec';
import { Component } from './component';

export class Controlable extends Component {
  override type: string = 'Controlable';

  constructor() {
    super();
  }
}
