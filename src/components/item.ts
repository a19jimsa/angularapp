import { Vec } from 'src/app/vec';
import { Component } from './component';

export class Item extends Component {
  override type: string = 'Item';
  position: Vec = new Vec(0, 0);
  stackable: boolean = false;
  isOver: boolean = false;
}
