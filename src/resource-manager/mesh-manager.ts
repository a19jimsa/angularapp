import { Model } from 'src/renderer/model';
import { Renderer } from 'src/renderer/renderer';
import { VertexArray } from 'src/renderer/vertex-array';
import { ShaderManager } from './shader-manager';

export class MeshManager {
  private static vertexArrays = new Map<string, VertexArray>();

  public static addMesh(model: Model, meshName: string, shaderName: string) {
    const vertexArray = new VertexArray(
      new Float32Array(model.vertices),
      new Uint16Array(model.indices)
    );
    this.setupMeshNew(vertexArray, shaderName);
    this.vertexArrays.set(meshName, vertexArray);
    console.log('Added mesh ' + meshName);
  }

  public static getMesh(index: string) {
    return this.vertexArrays.get(index);
  }

  public static setupMeshNew(vao: VertexArray, shaderName: string): void {
    const gl = Renderer.getGL;
    vao.bind();
    let index = 0;
    const shader = ShaderManager.getShader(shaderName);
    console.log(shader.layout);
    for (const element of shader.layout.elements) {
      gl.vertexAttribPointer(
        index,
        element.count,
        element.type,
        element.normalized,
        shader.layout.stride,
        element.offset
      );
      gl.enableVertexAttribArray(index);
      index++;
      console.log(index);
    }
    vao.unbind();
  }
}
