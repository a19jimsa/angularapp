import { BufferLayout } from 'src/renderer/buffer';
import { Renderer } from 'src/renderer/renderer';
import { Shader } from 'src/renderer/shader';
import { Manager } from 'src/resource-manager/manager';

export class ShaderManager extends Manager {
  private static shaders: Map<string, Shader> = new Map();

  public static async load(
    key: string,
    vertexUrl: string,
    fragmentUrl: string
  ) {
    const gl = Renderer.getGL;
    if (!gl) throw new Error('GL is not set!');
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
      const shader = new Shader(program);
      this.shaders.set(key, shader);
      console.log('Added shader ' + key);
      return shader;
    } else {
      throw new Error('Could not load shader! ' + key);
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
    const gl = Renderer.getGL;
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Cannot create WebglShader');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.log(source);
      console.error('Shader compile failed:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  private static createProgram(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ) {
    const gl = Renderer.getGL;
    const program = gl.createProgram()!; // IF not program then error gets it
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link failed:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    return program;
  }

  public static getShader(key: string): Shader {
    const shader = this.shaders.get(key);
    if (!shader) throw new Error('Cannot find shader');
    return shader;
  }
}
