import { BufferLayout } from 'src/renderer/buffer';
import { Model } from 'src/renderer/model';
import { Renderer } from 'src/renderer/renderer';
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
    instances: number,
  ) {
    const vertexArray = this.vertexArrays.get(meshName);
    if (!vertexArray) return;
    //Add instances * count of values
    const instanceBuffer = new Float32Array(instances * vbl.amount);
    vertexArray.addInstanceBuffer(vbl, instanceBuffer);
    console.log('Added instance buffer to ' + meshName);
  }

  public static getMesh(index: string) {
    return this.vertexArrays.get(index);
  }

  public static updateMesh(newModel: Model, meshId: string) {
    const vertexArray = this.vertexArrays.get(meshId);
    if (!vertexArray) return;

    const gl = Renderer.getGL;

    gl.bindVertexArray(vertexArray.VAO);
    // VBO
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexArray.vertexBuffer.buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(newModel.vertices),
      gl.DYNAMIC_DRAW,
    );

    // IBO
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexArray.indexBuffer.buffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(newModel.indices),
      gl.DYNAMIC_DRAW,
    );

    gl.bindVertexArray(null);

    vertexArray.vertexBuffer.vertices = new Float32Array(newModel.vertices);
    vertexArray.indexBuffer.indices = new Uint16Array(newModel.indices);
  }

  public static getAllMesh() {
    return Array.from(this.vertexArrays.values());
  }

  public static getMeshNames() {
    return Array.from(this.vertexArrays.keys());
  }
}
