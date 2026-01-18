import { BufferLayout } from 'src/renderer/buffer';
import { Model } from 'src/renderer/model';
import { VertexArray } from 'src/renderer/vertex-array';

export class MeshManager {
  private static vertexArrays = new Map<string, VertexArray>();

  public static addMesh(
    model: Model,
    meshName: string,
    bufferLayout: BufferLayout,
  ): string {
    if (this.vertexArrays.has(meshName)) return meshName;
    const vertexArray = new VertexArray(
      new Float32Array(model.vertices),
      new Uint16Array(model.indices),
    );
    //love this function place mmm
    vertexArray.addBuffer(bufferLayout);
    this.vertexArrays.set(meshName, vertexArray);
    console.log('Added mesh ' + meshName);
    return meshName;
  }

  public static addInstanceMesh(
    meshName: string,
    vbl: BufferLayout,
    positions: Float32Array,
  ) {
    const vertexArray = this.vertexArrays.get(meshName);
    if (!vertexArray) return;
    vertexArray.addInstanceBuffer(vbl, positions);
    console.log('Added instnace buffer to ' + meshName);
  }

  public static getMesh(index: string) {
    return this.vertexArrays.get(index);
  }
}
