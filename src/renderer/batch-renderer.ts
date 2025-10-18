import { VertexArrayBuffer } from './vertex-array-buffer';
import { PerspectiveCamera } from './perspective-camera';
import { Shader } from './shader';
import { Vec } from 'src/app/vec';
import { ShaderManager } from 'src/resource-manager/shader-manager';
import { TextureManager } from 'src/resource-manager/texture-manager';

export class BatchRenderer {
  private static gl: WebGL2RenderingContext;
  private static maxSprites: number = 1000;
  //Hörn (2 trianglar per quad ) KAN OPTIMERAS I FRAMTIDEN GENOM IBO
  private static verticesPerSprite: number = 6;
  //x y z u v
  private static floatsPerVertex: number = 5;
  //VBO object of all mesh data, 1000 sprites för 6 hörn och varje hörn har 8 attribut
  private static vbo: Float32Array = new Float32Array(
    this.maxSprites * this.verticesPerSprite * this.floatsPerVertex
  );
  private static vertexCount: number = 0;
  //Layout of our shader data to GPU
  private static vertexArrayBuffer: VertexArrayBuffer;
  private static shader: Shader;
  private static textureName: string = '';

  static init(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.vertexArrayBuffer = VertexArrayBuffer.create(
      gl,
      this.vbo,
      new Uint16Array([0, 1, 3, 2])
    );
    this.shader = ShaderManager.getShader('batch');
    this.shader.use();
    this.gl.bindVertexArray(this.vertexArrayBuffer.vao);
    const vbo = this.vertexArrayBuffer.vertexBuffer.buffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    const positionLoc = gl.getAttribLocation(this.shader.program, 'a_position');
    gl.vertexAttribPointer(
      positionLoc,
      3,
      gl.FLOAT,
      false,
      5 * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    gl.enableVertexAttribArray(positionLoc);
    const texLocation = gl.getAttribLocation(this.shader.program, 'a_texcoord');
    gl.vertexAttribPointer(
      texLocation,
      2,
      gl.FLOAT,
      false,
      5 * Float32Array.BYTES_PER_ELEMENT,
      3 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(texLocation);
  }

  static begin() {
    this.vertexCount = 0;
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
    order: number,
    translateX: number,
    translateY: number,
    translateZ: number
  ) {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const texWidth = width;
    const texHeight = height;

    const u0 = sx / texWidth;
    const v0 = sy / texHeight;

    const u1 = (sx + sw) / texWidth;
    const v1 = (sy + sh) / texHeight;

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
      order + translateZ,
      u0,
      v0,

      // top-right
      (x1 - pivotX) * cos - (y0 - pivotY) * sin + pivotX + translateX,
      (x1 - pivotX) * sin + (y0 - pivotY) * cos + pivotY + translateY,
      order + translateZ,
      u1,
      v0,

      // bottom-right
      (x1 - pivotX) * cos - (y1 - pivotY) * sin + pivotX + translateX,
      (x1 - pivotX) * sin + (y1 - pivotY) * cos + pivotY + translateY,
      order + translateZ,
      u1,
      v1,

      // Triangel 2
      // top-left (igen)
      (x0 - pivotX) * cos - (y0 - pivotY) * sin + pivotX + translateX,
      (x0 - pivotX) * sin + (y0 - pivotY) * cos + pivotY + translateY,
      order + translateZ,
      u0,
      v0,

      // bottom-right (igen)
      (x1 - pivotX) * cos - (y1 - pivotY) * sin + pivotX + translateX,
      (x1 - pivotX) * sin + (y1 - pivotY) * cos + pivotY + translateY,
      order + translateZ,
      u1,
      v1,

      // bottom-left
      (x0 - pivotX) * cos - (y1 - pivotY) * sin + pivotX + translateX,
      (x0 - pivotX) * sin + (y1 - pivotY) * cos + pivotY + translateY,
      order + translateZ,
      u0,
      v1,
    ];

    this.vbo.set(vertices, this.vertexCount * this.floatsPerVertex);
    this.vertexCount += 6;
  }

  static end(camera: PerspectiveCamera) {
    const gl = this.gl;
    this.vertexArrayBuffer.bind();
    gl.useProgram(this.shader.program);
    gl.activeTexture(gl.TEXTURE0 + TextureManager.getSlot(this.textureName));
    gl.bindTexture(gl.TEXTURE_2D, TextureManager.getTexture(this.textureName));
    const texLocation = gl.getUniformLocation(this.shader.program, 'u_texture');
    gl.uniform1i(texLocation, 0);
    const location = gl.getUniformLocation(this.shader.program, 'u_matrix');
    gl.uniformMatrix4fv(location, false, camera.getViewProjectionMatrix());
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexArrayBuffer.vertexBuffer.buffer);
    gl.bufferSubData(
      this.gl.ARRAY_BUFFER,
      0,
      this.vbo.subarray(0, this.vertexCount * this.floatsPerVertex)
    );
    gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
    this.vertexArrayBuffer.unbind();
  }
}
