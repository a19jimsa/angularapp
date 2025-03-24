export class Shader {
  gl: WebGL2RenderingContext;
  vertexShader: WebGLShader;
  fragmentShader: WebGLShader;
  program: WebGLProgram;
  constructor(
    gl: WebGL2RenderingContext,
    vertexSource: string,
    fragmentSource: string
  ) {
    this.gl = gl;
    this.vertexShader = this.createShader(gl.VERTEX_SHADER, vertexSource)!;
    this.fragmentShader = this.createShader(
      gl.FRAGMENT_SHADER,
      fragmentSource
    )!;
    this.program = this.createProgram()!;
  }

  createShader(type: GLenum, source: string) {
    const shader = this.gl.createShader(type)!;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compile failed:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  createProgram() {
    const program = this.gl.createProgram()!; // IF not program then error gets it
    this.gl.attachShader(program, this.vertexShader);
    this.gl.attachShader(program, this.fragmentShader);
    this.gl.linkProgram(program);
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Program link failed:', this.gl.getProgramInfoLog(program));
      this.gl.deleteProgram(program);
      return null;
    }
    return program;
  }

  use() {
    this.gl.useProgram(this.program);
  }

  getUniformLocation(name: string) {
    return this.gl.getUniformLocation(this.program, name);
  }
}
