import { Shader } from './shader';
import { Camera } from './camera';

export class Renderer {
  angle = 0;
  gl: WebGL2RenderingContext;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
  }

  public clear() {}

  public render(shader: Shader, camera: Camera) {}

  createCube() {
    const vertices = new Float32Array([
      // Position (x, y, z)   // Färg (r, g, b)
      -0.5,
      -0.5,
      -0.5,
      1.0,
      0.0,
      0.0, // Vänster-nedre-bak
      0.5,
      -0.5,
      -0.5,
      0.0,
      1.0,
      0.0, // Höger-nedre-bak
      0.5,
      0.5,
      -0.5,
      0.0,
      0.0,
      1.0, // Höger-övre-bak
      -0.5,
      0.5,
      -0.5,
      1.0,
      1.0,
      0.0, // Vänster-övre-bak
      -0.5,
      -0.5,
      0.5,
      1.0,
      0.0,
      1.0, // Vänster-nedre-fram
      0.5,
      -0.5,
      0.5,
      0.0,
      1.0,
      1.0, // Höger-nedre-fram
      0.5,
      0.5,
      0.5,
      1.0,
      1.0,
      1.0, // Höger-övre-fram
      -0.5,
      0.5,
      0.5,
      0.0,
      0.0,
      0.0, // Vänster-övre-fram
    ]);

    const indices = new Uint16Array([
      0,
      1,
      2,
      0,
      2,
      3, // Bakre sida
      4,
      5,
      6,
      4,
      6,
      7, // Främre sida
      0,
      4,
      7,
      0,
      7,
      3, // Vänster sida
      1,
      5,
      6,
      1,
      6,
      2, // Höger sida
      3,
      2,
      6,
      3,
      6,
      7, // Övre sida
      0,
      1,
      5,
      0,
      5,
      4, // Undre sida
    ]);
  }
}
