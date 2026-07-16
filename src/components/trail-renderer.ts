import { vec3 } from 'gl-matrix';
import { Component } from './component';

export class TrailRenderer extends Component {
  override type: string = 'TrailRenderer';
  vertices: number[] = new Array();
  lastPosition: vec3 = vec3.create();
  width: number = 2;
  time: number = 0.2;
  accumulator: number = 0;
  minVertexDistance: number = 0.1;
  emitting: boolean = true;
  color: vec3 = vec3.create();
  meshId: string;
  constructor(meshId: string) {
    super();
    this.meshId = meshId;
  }
}
