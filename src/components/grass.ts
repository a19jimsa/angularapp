import { Shader } from 'src/renderer/shader';
import { Component } from './component';
import { VertexArrayBuffer } from 'src/renderer/vertex-array-buffer';

export class Grass extends Component {
  override type: string = 'Grass';
  positions: number[] = new Array();
}
