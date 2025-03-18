import { Entity } from 'src/app/entity';
import { Component } from './component';

export class Inventory extends Component {
  override type: string = 'Inventory';
  items: Map<Entity, Component[]> = new Map<Entity, Component[]>();
  amount: Map<Entity, number> = new Map<Entity, number>();
  show: boolean = false;
}
