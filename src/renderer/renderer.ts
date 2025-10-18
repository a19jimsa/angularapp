import { mat4, vec3 } from 'gl-matrix';
import { MathUtils } from 'src/Utils/MathUtils';

export class Renderer {
  angle = 0;
  gl: WebGL2RenderingContext;
  modelMatrix: mat4;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.modelMatrix = mat4.create();
  }

  public clear() {}

  createCube() {}

  translate(x: number, y: number, z: number) {
    mat4.translate(
      this.modelMatrix,
      this.modelMatrix,
      vec3.fromValues(x, y, z)
    );
  }

  rotateX(rotation: number) {
    mat4.rotate(
      this.modelMatrix,
      this.modelMatrix,
      MathUtils.degreesToRadians(rotation),
      vec3.fromValues(1, 0, 0)
    );
  }

  rotateY(rotation: number) {
    mat4.rotate(
      this.modelMatrix,
      this.modelMatrix,
      MathUtils.degreesToRadians(rotation),
      vec3.fromValues(0, 1, 0)
    );
  }

  rotateZ(rotation: number) {
    mat4.rotate(
      this.modelMatrix,
      this.modelMatrix,
      MathUtils.degreesToRadians(rotation),
      vec3.fromValues(0, 0, 1)
    );
  }

  scale() {}
}
