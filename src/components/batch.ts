import { vec3 } from 'gl-matrix';
import { Component } from './component';

export type BatchType = {
  positions: vec3;
  slot: number;
};

export class Batch extends Component {
  override type: string = 'Batch';
  positions: BatchType[] = new Array();
  constructor() {
    super();
  }
}
