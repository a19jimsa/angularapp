import { mat4 } from 'gl-matrix';

export class Shader {
  gl: WebGL2RenderingContext;
  //Can not be null then no shader are loaded into program and exection fails.
  program!: WebGLProgram;
  constructor(
    gl: WebGL2RenderingContext
  ) {
    this.gl = gl;
  }

  public async initShaders(vertexUrl: string, fragmentUrl: string){
    const gl = this.gl;
    const shaders = await this.loadShader("/assets/shaders/" + vertexUrl, "/assets/shaders/" + fragmentUrl);
    const vertexShader = this.createShader(gl.VERTEX_SHADER, shaders[0])!;
    const fragmentShader = this.createShader(
      gl.FRAGMENT_SHADER,
      shaders[1]
    )!;
    const program = this.createProgram(vertexShader, fragmentShader);
    if(program){
      this.program = program;
    }else{
      console.error(program);
    }
  }

  private async loadShader(vertexSource: string, fragmentSource: string){
    const something = await Promise.all([fetch(vertexSource).then(res => res.text()),
      fetch(fragmentSource).then(res => res.text())
    ]);
    return something;
  }

  private createShader(type: GLenum, source: string) {
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

  private createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
    const program = this.gl.createProgram()!; // IF not program then error gets it
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
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
    return this.gl.getUniformLocation(this.program!, name);
  }

  uploadUniformMat4(name: string, matrix: mat4) {
    const location = this.gl.getUniformLocation(this.program!, name);
    if (!location) return;
    this.gl.uniformMatrix4fv(location, false, matrix);
  }
}
