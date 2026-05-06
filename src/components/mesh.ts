import { Component } from './component';

export class Mesh extends Component {
  override type: string = 'Mesh';
  width: number;
  height: number;
  shaderId: string;
  meshId: string;
  dirty: boolean = false;

  constructor(width: number, height: number, shaderId: string, meshId: string) {
    super();
    this.width = width;
    this.height = height;
    this.shaderId = shaderId;
    this.meshId = meshId;
  }

  serialize() {
    return {
      width: this.width,
      height: this.height,
      shaderId: this.shaderId,
      meshId: this.meshId,
      dirty: true,
    };
  }

  deserialize(component: Mesh) {
    return new Mesh(
      component.width,
      component.height,
      component.shaderId,
      component.meshId,
    );
  }
}
