import { ShaderManager } from 'src/resource-manager/shader-manager';
import { BufferLayout } from './buffer';
import { PerspectiveCamera } from './perspective-camera';
import { Renderer } from './renderer';
import { ShaderDataType, ShaderType } from './shader-data-type';
import { VertexArray } from './vertex-array';
import { mat4 } from 'gl-matrix';

export class LineBatch {
  private static floatsPerVertex = 6;
  private static maxLines = 1000;
  private static vertices = new Float32Array(
    this.floatsPerVertex * this.maxLines,
  );
  private static floatOffset = 0;
  private static vertexCount = 0;
  private static vertexArray: VertexArray;

  static init(): void {}

  static begin(): void {
    this.floatOffset = 0;
    this.vertexCount = 0;
  }

  static addVertex(x: number, y: number) {
    const vertices = new Array();
    vertices.push(x, y, 0, 0, 0, 1);
    this.vertices.set(vertices, this.floatOffset);
    this.floatOffset += this.floatsPerVertex;
    this.vertexCount += 1;
  }

  static end(camera: PerspectiveCamera) {
    const gl = Renderer.getGL;
    const shader = ShaderManager.getShader('debug');
    if (!shader) throw new Error('Could not find shader debug!');
    shader.bind();
    shader.setUniformMat4('u_matrix', camera.getViewProjectionMatrix());
    shader.setUniformMat4('u_model', mat4.create());
    this.vertexArray.bind();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexArray.vertexBuffer.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.LINES, 0, this.vertexCount);
    shader.unbind();
    this.vertexArray.unbind();
  }
}
