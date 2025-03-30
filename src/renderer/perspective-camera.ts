import { mat4, vec3 } from 'gl-matrix';
import { MathUtils } from 'src/Utils/MathUtils';

export class PerspectiveCamera {
  private projectionMatrix: mat4 = mat4.create();
  private viewMatrix: mat4 = mat4.create();
  private viewProjectionMatrix: mat4 = mat4.create();
  private position: vec3 = vec3.fromValues(0, 0, 0);
  private rotation: number = 0;

  constructor() {
    mat4.perspective(
      this.projectionMatrix,
      MathUtils.degreesToRadians(60),
      800 / 600,
      0.1,
      500
    );
    mat4.lookAt(
      this.viewMatrix,
      vec3.fromValues(0, 0, 100),
      vec3.fromValues(0, 0, 0),
      vec3.fromValues(0, 1, 0)
    );
    mat4.multiply(
      this.viewProjectionMatrix,
      this.projectionMatrix,
      this.viewMatrix
    );
  }

  rotate(angle: number) {
    this.rotation += angle;
    mat4.rotate(
      this.viewMatrix,
      this.viewMatrix,
      MathUtils.degreesToRadians(this.rotation),
      vec3.fromValues(0, 1, 0)
    );
    mat4.multiply(
      this.viewProjectionMatrix,
      this.projectionMatrix,
      this.viewMatrix
    );
  }

  updatePosition(x: number, y: number, z: number) {
    this.position[0] += x;
    this.position[1] += y;
    this.position[2] += z;
    mat4.translate(this.viewMatrix, this.viewMatrix, this.position);
    mat4.multiply(
      this.viewProjectionMatrix,
      this.projectionMatrix,
      this.viewMatrix
    );
  }

  getViewProjectionMatrix() {
    return this.viewProjectionMatrix;
  }
}
