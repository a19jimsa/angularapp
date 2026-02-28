import { BufferLayout } from 'src/renderer/buffer';
import { Model } from 'src/renderer/model';
import { VertexArray } from 'src/renderer/vertex-array';

export class MeshManager {
  private static vertexArrays = new Map<string, VertexArray>();

  public static addMesh(model: Model, meshName: string): string {
    if (this.vertexArrays.has(meshName)) return meshName;
    const vertexArray = new VertexArray(
      new Float32Array(model.vertices),
      new Uint16Array(model.indices),
    );
    //love this function place mmm
    vertexArray.addBuffer(model.bufferLayout);
    this.vertexArrays.set(meshName, vertexArray);
    console.log('Added mesh ' + meshName);
    return meshName;
  }

  public static addInstanceMesh(
    meshName: string,
    vbl: BufferLayout,
    positions: number[],
  ) {
    const vertexArray = this.vertexArrays.get(meshName);
    if (!vertexArray) return;
    vertexArray.addInstanceBuffer(vbl, positions);
    console.log('Added instance buffer to ' + meshName);
  }

  public static getMesh(index: string) {
    return this.vertexArrays.get(index);
  }

  public static updateMesh(newModel: Model, meshId: string) {
    const vertexArray = this.vertexArrays.get(meshId);
    if (!vertexArray) return;
    const vao = VertexArray.create(
      new Float32Array(newModel.vertices),
      new Uint16Array(newModel.indices),
    );
    vao.addBuffer(vertexArray.bufferLayout);
    this.vertexArrays.set(meshId, vertexArray);
  }
}
