import { BufferLayout } from 'src/renderer/buffer';
import { Model } from 'src/renderer/model';
import { VertexArray } from 'src/renderer/vertex-array';

export class MeshManager {
  private static vertexArrays = new Map<string, VertexArray>();

  public static addMesh(
    model: Model,
    meshName: string,
    bufferLayout: BufferLayout
  ) {
    const vertexArray = new VertexArray(
      new Float32Array(model.vertices),
      new Uint16Array(model.indices)
    );
    vertexArray.addBuffer(bufferLayout);
    this.vertexArrays.set(meshName, vertexArray);
    console.log('Added mesh ' + meshName);
    return vertexArray;
  }

  public static getMesh(index: string) {
    return this.vertexArrays.get(index);
  }
}
