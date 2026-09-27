import { BufferLayout } from 'src/renderer/buffer';
import { Model } from 'src/renderer/model';
import { Renderer } from 'src/renderer/renderer';
import { VertexArray } from 'src/renderer/vertex-array';

export class MeshManager {
  private static vertexArrays = new Map<string, VertexArray>();

  public static addMesh(model: Model, meshName: string): VertexArray {
    const mesh = this.vertexArrays.get(meshName);
    if (mesh) {
      return mesh;
    }
    const vertexArray = new VertexArray(
      new Float32Array(model.vertices),
      new Uint16Array(model.indices),
    );
    //love this function place mmm
    vertexArray.addBuffer(model.bufferLayout);
    this.vertexArrays.set(meshName, vertexArray);
    console.log('Added mesh ' + meshName);
    return vertexArray;
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

  public static updateMesh(mesh: VertexArray) {
    const gl = Renderer.getGL;
    gl.bindVertexArray(mesh.VAO);
    // VBO
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.vertexBuffer.vertices, gl.STATIC_DRAW);
    // IBO
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer.buffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      mesh.indexBuffer.indices,
      gl.STATIC_DRAW,
    );
    gl.bindVertexArray(null);
  }

  public static getAllMesh() {
    return Array.from(this.vertexArrays.values());
  }

  public static getMeshNames() {
    return Array.from(this.vertexArrays.keys());
  }
}
