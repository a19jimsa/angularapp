import { Shader } from 'src/renderer/shader';
import { Manager } from 'src/resource-manager/manager';

export class ShaderManager extends Manager {
  private static shaders: Map<string, Shader> = new Map();

  public static setGl(gl: WebGL2RenderingContext) {
    this.gl = gl;
  }

  public static async load(
    key: string,
    vertexUrl: string,
    fragmentUrl: string
  ) {
    if (!this.gl) throw new Error('Gl is not set!');
    const gl = this.gl;
    console.log(vertexUrl, fragmentUrl);
    const shaders = await this.loadShader(
      '../assets/shaders/' + vertexUrl,
      '../assets/shaders/' + fragmentUrl
    );
    const vertexShader = this.createShader(gl.VERTEX_SHADER, shaders[0]);
    const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, shaders[1]);
    if (!vertexShader || !fragmentShader)
      throw new Error('Cannot create shader from url');
    const program = this.createProgram(vertexShader, fragmentShader);
    if (program) {
      const shader = new Shader(gl, program);
      this.shaders.set(key, shader);
      console.log('Added shader');
    } else {
      console.error(program);
    }
  }

  private static async loadShader(
    vertexSource: string,
    fragmentSource: string
  ) {
    const shaderPromise = await Promise.all([
      fetch(vertexSource).then((res) => res.text()),
      fetch(fragmentSource).then((res) => res.text()),
    ]);
    return shaderPromise;
  }

  private static createShader(type: GLenum, source: string) {
    const shader = this.gl.createShader(type);
    if (!shader) throw new Error('Cannot create WebglShader');
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.log(source);
      console.error('Shader compile failed:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  private static createProgram(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ) {
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

  public static getShader(key: string): Shader {
    const shader = this.shaders.get(key);
    if (!shader) throw new Error('Cannot find shader');
    console.log(shader);
    return shader;
  }
}
