import { Component } from './component';
import { Material } from 'src/renderer/material';

export class MeshRenderer extends Component {
  override type: string = 'MeshRenderer';
  meshId: string;
  textureIds: string[];
  material: Material;
  shaderId: string;
  dirty: boolean = false;

  constructor(
    meshId: string,
    textureIds: string[],
    material: Material,
    shaderId: string,
  ) {
    super();
    this.meshId = meshId;
    this.textureIds = textureIds;
    this.material = material;
    this.shaderId = shaderId;
  }
}
