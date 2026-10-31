import { Component } from './component';

export class Splatmap extends Component {
  override type: string = 'Splatmap';
  splatmapId: string;
  size: number;
  dirty: boolean = true;
  slot: string;
  layers: number = -1;
  constructor(splatmapId: string, size: number, slot: string) {
    super();
    this.splatmapId = splatmapId;
    this.size = size;
    this.slot = slot;
  }
}
