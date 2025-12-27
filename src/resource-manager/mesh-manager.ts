import { MeshRenderer } from 'src/renderer/mesh-renderer';
import { Renderer } from 'src/renderer/renderer';
import { VertexArray } from 'src/renderer/vertex-array';

export class MeshManager {
  private static vaos = new Map<number, VertexArray>();
  private static index = 0;

  public static addMesh(vertices: number[], indices: number[]) {
    const vertexArray = new VertexArray(
      new Float32Array(vertices),
      new Uint16Array(indices)
    );
    const mesh = new MeshRenderer(Renderer.getGL);
    mesh.setupMesh(vertexArray);
    this.vaos.set(this.index, vertexArray);
    console.log('Added mesh' + this.index);
    this.index++;
    return vertexArray;
  }

  public static getMesh(index: number) {
    return this.vaos.get(index);
  }

  public static getindex() {
    return this.index;
  }
}
