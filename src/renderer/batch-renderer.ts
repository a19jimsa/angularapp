import { VertexArray } from './vertex-array';
import { PerspectiveCamera } from './perspective-camera';
import { ShaderManager } from 'src/resource-manager/shader-manager';
import { Renderer } from './renderer';
import { BufferLayout } from './buffer';
import { ShaderDataType, ShaderType } from './shader-data-type';
import { vec2 } from 'gl-matrix';

export class BatchRenderer {
  private maxSprites: number = 1000;
  //Hörn (2 trianglar per quad ) KAN OPTIMERAS I FRAMTIDEN GENOM IBO
  private verticesPerSprite: number = 6;
  //x y z u v texid
  private floatsPerVertex: number = 6;
  private vertexCount: number = 0;
  //Layout of our shader data to GPU
  private vertexArray: VertexArray;

  constructor() {
    this.vertexArray = VertexArray.create(
      new Float32Array(
        this.maxSprites * this.verticesPerSprite * this.floatsPerVertex,
      ),
      new Uint16Array([0, 1, 3, 2]),
    );
    const buffer = new BufferLayout();
    buffer.add(0, ShaderDataType.GetType(ShaderType.Float), 3, false);
    buffer.add(1, ShaderDataType.GetType(ShaderType.Float), 2, false);
    buffer.add(2, ShaderDataType.GetType(ShaderType.Float), 1, false);
    this.vertexArray.addBuffer(buffer);
  }

  updateBuffer(vertices: Float32Array) {
    const buffer = new BufferLayout();
    buffer.add(3, ShaderDataType.GetType(ShaderType.Float), 1, false);
    this.vertexArray.addInstanceBuffer(buffer, vertices);
  }

  begin() {
    this.vertexCount = 0;
  }

  addQuads(
    width: number,
    height: number,
    rotation: number,
    pivot: vec2,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dz: number,
    dw: number,
    dh: number,
    layer: number,
  ) {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const texWidth = width;
    const texHeight = height;

    const u0 = sx / texWidth;
    const v0 = 1 - sy / texHeight;

    const u1 = (sx + sw) / texWidth;
    const v1 = 1 - (sy + sh) / texHeight;

    const x0 = dx;
    const y0 = dy;
    const z0 = dz;
    const x1 = dx + dw;
    const y1 = dy + dh;

    // Pivot i world-space
    const pivotX = dx + pivot[0] + sw / 2;
    const pivotY = dy + pivot[1];

    const vertices = [
      // Triangel 1
      // top-left
      (x0 - pivotX) * cos - (y0 - pivotY) * sin + pivotX,
      (x0 - pivotX) * sin + (y0 - pivotY) * cos + pivotY,
      z0,
      u0,
      v0,
      layer,

      // top-right
      (x1 - pivotX) * cos - (y0 - pivotY) * sin + pivotX,
      (x1 - pivotX) * sin + (y0 - pivotY) * cos + pivotY,
      z0,
      u1,
      v0,
      layer,

      // bottom-right
      (x1 - pivotX) * cos - (y1 - pivotY) * sin + pivotX,
      (x1 - pivotX) * sin + (y1 - pivotY) * cos + pivotY,
      z0,
      u1,
      v1,
      layer,

      // Triangel 2
      // top-left (igen)
      (x0 - pivotX) * cos - (y0 - pivotY) * sin + pivotX,
      (x0 - pivotX) * sin + (y0 - pivotY) * cos + pivotY,
      z0,
      u0,
      v0,
      layer,

      // bottom-right (igen)
      (x1 - pivotX) * cos - (y1 - pivotY) * sin + pivotX,
      (x1 - pivotX) * sin + (y1 - pivotY) * cos + pivotY,
      z0,
      u1,
      v1,
      layer,

      // bottom-left
      (x0 - pivotX) * cos - (y1 - pivotY) * sin + pivotX,
      (x0 - pivotX) * sin + (y1 - pivotY) * cos + pivotY,
      z0,
      u0,
      v1,
      layer,
    ];

    this.vertexArray.vertexBuffer.vertices.set(
      vertices,
      this.vertexCount * this.floatsPerVertex,
    );
    this.vertexCount += this.floatsPerVertex;
  }

  end(camera: PerspectiveCamera, shaderID: string) {
    const gl = Renderer.getGL;
    const shader = ShaderManager.getShader(shaderID);
    console.log(shaderID);
    if (!shader)
      throw new Error('Could not get shader with shaderID ' + shaderID);
    shader.bind();
    shader.setUniformMat4('u_matrix', camera.getViewProjectionMatrix());
    shader.setFloat('u_time', performance.now());
    if (!this.vertexArray) throw new Error('Could not get vertex array');
    const buffer = this.vertexArray.vertexBuffer.buffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferSubData(
      gl.ARRAY_BUFFER,
      0,
      this.vertexArray.vertexBuffer.vertices.subarray(
        0,
        this.vertexCount * this.floatsPerVertex,
      ),
    );
    this.vertexArray.bind();
    gl.depthMask(false);
    gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
    gl.depthMask(true);
    this.vertexArray.unbind();
    shader.unbind();
  }
}
