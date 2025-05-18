import { Shader } from 'src/renderer/shader';
import { Component } from './component';
import { VertexArrayBuffer } from 'src/renderer/vertex-array-buffer';

export class Grass extends Component {
  override type: string = 'Grass';
  positions: number[] = new Array();
  buffer: WebGLBuffer;

  constructor(
    vao: VertexArrayBuffer,
    gl: WebGL2RenderingContext,
    shader: Shader
  ) {
    super();
    for (let i = 0; i < 1000; i++) {
      const randomX = Math.random() * 200;
      const randomZ = Math.random() * 200;
      this.positions.push(randomX, 0, randomZ);
    }
    console.log(this.positions.length);

    shader.use();
    vao.bind();
    const grassBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, grassBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.positions),
      gl.STATIC_DRAW
    );

    const location = gl.getAttribLocation(
      shader.program,
      'a_instancePositions'
    );
    console.log(location);
    gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribDivisor(location, 1); // ← per‑instans
    gl.useProgram(null);
    vao.unbind();
    this.buffer = grassBuffer!;
  }
}
