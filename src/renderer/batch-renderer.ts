import { VertexArray } from './vertex-array';
import { PerspectiveCamera } from './perspective-camera';
import { Vec } from 'src/app/vec';
import { ShaderManager } from 'src/resource-manager/shader-manager';
import { Renderer } from './renderer';

export class BatchRenderer {
  private static gl: WebGL2RenderingContext;
  private static maxSprites: number = 1000;
  //Hörn (2 trianglar per quad ) KAN OPTIMERAS I FRAMTIDEN GENOM IBO
  private static verticesPerSprite: number = 6;
  //x y z u v
  private static floatsPerVertex: number = 6;
  //VBO object of all mesh data, 1000 sprites för 6 hörn och varje hörn har 7 attribut
  private static vbo: Float32Array = new Float32Array(
    this.maxSprites * this.verticesPerSprite * this.floatsPerVertex
  );
  private static vertexCount: number = 0;
  //Layout of our shader data to GPU
  private static vertexArray: VertexArray;

  static init() {
    this.gl = Renderer.getGL;
    const gl = this.gl;
    this.vertexArray = VertexArray.create(
      this.vbo,
      new Uint16Array([0, 1, 3, 2])
    );

    const shader = ShaderManager.getShader('batch');
    shader.bind();
    this.vertexArray.bind();
    const vbo = this.vertexArray.vertexBuffer.buffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    const positionLoc = gl.getAttribLocation(shader.program, 'a_position');
    gl.vertexAttribPointer(
      positionLoc,
      3,
      gl.FLOAT,
      false,
      6 * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    gl.enableVertexAttribArray(positionLoc);
    const texLocation = gl.getAttribLocation(shader.program, 'a_texcoord');
    gl.vertexAttribPointer(
      texLocation,
      2,
      gl.FLOAT,
      false,
      6 * Float32Array.BYTES_PER_ELEMENT,
      3 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(texLocation);
    const textureIDLocation = gl.getAttribLocation(
      shader.program,
      'a_texIndex'
    );
    gl.vertexAttribPointer(
      textureIDLocation,
      1,
      gl.FLOAT,
      false,
      6 * Float32Array.BYTES_PER_ELEMENT,
      5 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(textureIDLocation);
    //Send all texturearray ids to shader
    const texturesLocation = gl.getUniformLocation(
      shader.program,
      'u_textures'
    );
    //Upload textureID
    gl.uniform1iv(texturesLocation, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  }

  static begin() {
    this.vertexCount = 0;
  }

  static addSimpleQuads(width: number, height: number, textureIndex: number) {
    const z = 0;
    const vertices = [
      // Triangel 1
      // top-left
      0,
      height,
      0,
      0,
      0,
      textureIndex,

      // top-right
      width,
      height,
      0,
      0,
      0,
      textureIndex,

      // bottom-right
      0,
      width,
      0,
      0,
      0,
      textureIndex,

      // Triangel 2
      // top-left (igen)
      0,
      height,
      0,
      0,
      0,
      textureIndex,

      // bottom-right (igen)
      0,
      width,
      0,
      0,
      0,
      textureIndex,

      // bottom-left
      0,
      0,
      0,
      0,
      0,
      textureIndex,
    ];

    this.vbo.set(vertices, this.vertexCount * this.floatsPerVertex);
    this.vertexCount += this.floatsPerVertex;
  }

  static addQuads(
    width: number,
    height: number,
    rotation: number,
    pivot: Vec,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
    translateX: number,
    translateY: number,
    translateZ: number,
    textureIndex: number
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
    const x1 = dx + dw;
    const y1 = dy + dh;

    // Pivot i world-space
    const pivotX = dx + pivot.x + sw / 2;
    const pivotY = dy + pivot.y;

    const vertices = [
      // Triangel 1
      // top-left
      (x0 - pivotX) * cos - (y0 - pivotY) * sin + pivotX + translateX,
      (x0 - pivotX) * sin + (y0 - pivotY) * cos + pivotY + translateY,
      translateZ,
      u0,
      v0,
      textureIndex,

      // top-right
      (x1 - pivotX) * cos - (y0 - pivotY) * sin + pivotX + translateX,
      (x1 - pivotX) * sin + (y0 - pivotY) * cos + pivotY + translateY,
      translateZ,
      u1,
      v0,
      textureIndex,

      // bottom-right
      (x1 - pivotX) * cos - (y1 - pivotY) * sin + pivotX + translateX,
      (x1 - pivotX) * sin + (y1 - pivotY) * cos + pivotY + translateY,
      translateZ,
      u1,
      v1,
      textureIndex,

      // Triangel 2
      // top-left (igen)
      (x0 - pivotX) * cos - (y0 - pivotY) * sin + pivotX + translateX,
      (x0 - pivotX) * sin + (y0 - pivotY) * cos + pivotY + translateY,
      translateZ,
      u0,
      v0,
      textureIndex,

      // bottom-right (igen)
      (x1 - pivotX) * cos - (y1 - pivotY) * sin + pivotX + translateX,
      (x1 - pivotX) * sin + (y1 - pivotY) * cos + pivotY + translateY,
      translateZ,
      u1,
      v1,
      textureIndex,

      // bottom-left
      (x0 - pivotX) * cos - (y1 - pivotY) * sin + pivotX + translateX,
      (x0 - pivotX) * sin + (y1 - pivotY) * cos + pivotY + translateY,
      translateZ,
      u0,
      v1,
      textureIndex,
    ];

    this.vbo.set(vertices, this.vertexCount * this.floatsPerVertex);
    this.vertexCount += this.floatsPerVertex;
  }

  static end(camera: PerspectiveCamera) {
    const gl = this.gl;
    const shader = ShaderManager.getShader('batch');
    shader.bind();
    this.vertexArray.bind();
    shader.setUniformMat4('u_matrix', camera.getViewProjectionMatrix());
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexArray.vertexBuffer.buffer);
    gl.bufferSubData(
      this.gl.ARRAY_BUFFER,
      0,
      this.vbo.subarray(0, this.vertexCount * this.floatsPerVertex)
    );
    gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
    this.vertexArray.unbind();
    shader.unbind();
  }
}
