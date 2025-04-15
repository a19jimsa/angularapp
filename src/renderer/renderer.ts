import { Shader } from './shader';
import { Camera } from './camera';
import { Texture } from './texture';
import { PerspectiveCamera } from './perspective-camera';
import { OrtographicCamera } from './orthographic-camera';
import { Mesh } from './mesh';
import { VertexArrayBuffer } from './vertex-array-buffer';

export class Renderer {
  angle = 0;
  gl: WebGL2RenderingContext;
  camera: PerspectiveCamera | OrtographicCamera;
  shader: Shader;

  constructor(gl: WebGL2RenderingContext, camera: PerspectiveCamera | OrtographicCamera, shader: Shader) {
    this.gl = gl;
    this.camera = camera;
    this.shader = shader;
  }

  public clear() {
  }

  createCube() {
    
  }

  drawTriangle(x: number, y: number){
    this.shader.use();
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
  }

  drawImage(texture: Texture, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number){
    const texWidth = texture.getImage().width;
    const texHeight = texture.getImage().height;

    const u0 = sx / texWidth;
    const v0 = sy / texHeight;

    const u1 = (sx + sw) / texWidth;
    const v1 = (sy + sh) / texHeight; 

    const x0 = dx;
    const y0 = dy;
    const x1 = dx + dw;
    const y1 = dy + dh;

    const vertices = [
      x0, y0, u0, v0,
      x1, y0, u1, v0,
      x1, y1, u1, v1,
      x0, y1, u0, v1
    ]

    const indices = [
      0, 1, 2,
      0, 2, 3
    ]

    const gl = this.gl;
    this.shader.use();
    const vertexBuffer = gl.createBuffer();
    gl.bindTexture(gl.TEXTURE_2D, texture.getTexture());
    gl.activeTexture(gl.TEXTURE0 + texture.getSlot());
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.enableVertexAttribArray(0);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(1);

    this.gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  }

  drawBatch(texture: Texture, vao: VertexArrayBuffer){
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, texture.getTexture());
    gl.activeTexture(gl.TEXTURE0 + texture.getSlot());
    this.shader.use();
    this.gl.drawElements(gl.TRIANGLES, vao.indexBuffer.getCount(), gl.UNSIGNED_SHORT, 0);
  }

  translate(x: number, y: number, z: number){

  }
}
