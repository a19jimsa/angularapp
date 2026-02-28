import { Ecs } from 'src/core/ecs';
import { Component } from './component';

export class Mesh extends Component {
  override type: string = 'Mesh';
  vertices: number[];
  indices: number[];
  width: number;
  height: number;
  meshId: string;
  dirty: boolean = false;

  constructor(
    vertices: number[],
    indices: number[],
    width: number,
    height: number,
    meshId: string,
  ) {
    super();
    this.vertices = vertices;
    this.indices = indices;
    this.width = width;
    this.height = height;
    this.meshId = meshId;
  }

  serialize() {
    return {
      vertices: this.vertices,
      indices: this.indices,
      width: this.width,
      height: this.height,
      meshId: this.meshId,
      dirty: true,
    };
  }

  deserialize(component: Mesh) {
    return new Mesh(
      component.vertices,
      component.indices,
      component.width,
      component.height,
      component.meshId,
    );
  }
}
