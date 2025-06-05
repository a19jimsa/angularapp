import { Shader } from 'src/renderer/shader';
import { Component } from './component';
import { VertexArrayBuffer } from 'src/renderer/vertex-array-buffer';

export class Grass extends Component {
  override type: string = 'Grass';
  positions: number[] = new Array();
  maxGrassBuffer: number = 10000;
  amountOfGrass: number = 0;
  buffer: WebGLBuffer;

  constructor(
    vao: VertexArrayBuffer,
    gl: WebGL2RenderingContext,
    shader: Shader
  ) {
    super();
    shader.use();
    vao.bind();
    const grassBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, grassBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(3 * this.maxGrassBuffer),
      gl.STATIC_DRAW
    );

    const location = gl.getAttribLocation(
      shader.program,
      'a_instancePositions'
    );
    gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribDivisor(location, 1); // ← per‑instans
    gl.useProgram(null);
    vao.unbind();
    this.buffer = grassBuffer!;
  }
}
