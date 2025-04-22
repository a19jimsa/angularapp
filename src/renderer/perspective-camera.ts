import { mat4, vec3 } from 'gl-matrix';
import { MathUtils } from 'src/Utils/MathUtils';

export class PerspectiveCamera {
  private projectionMatrix: mat4 = mat4.create();
  private viewMatrix: mat4 = mat4.create();
  private viewProjectionMatrix: mat4 = mat4.create();
  position: vec3 = vec3.fromValues(0, 45, 0);
  private rotation: number = 0;

  constructor(width: number, height: number) {
    mat4.perspective(
      this.projectionMatrix,
      MathUtils.degreesToRadians(100),
      width / height,
      0.1,
      1000
    );
    mat4.lookAt(
      this.viewMatrix,
      this.position,
      vec3.fromValues(0, 0, 0),
      vec3.fromValues(0, 0, 1)
    );
    mat4.multiply(
      this.viewProjectionMatrix,
      this.projectionMatrix,
      this.viewMatrix
    );
    console.log('Skapade kamera');
  }

  rotateZ(angle: number) {
    mat4.rotate(
      this.viewMatrix,
      this.viewMatrix,
      MathUtils.degreesToRadians(angle),
      vec3.fromValues(0, 0, 1)
    );
    mat4.multiply(
      this.viewProjectionMatrix,
      this.projectionMatrix,
      this.viewMatrix
    );
  }

  rotateY(angle: number) {
    mat4.rotate(
      this.viewMatrix,
      this.viewMatrix,
      MathUtils.degreesToRadians(angle),
      vec3.fromValues(0, 1, 0)
    );
    mat4.multiply(
      this.viewProjectionMatrix,
      this.projectionMatrix,
      this.viewMatrix
    );
  }

  rotateX(angle: number) {
    mat4.rotate(
      this.viewMatrix,
      this.viewMatrix,
      MathUtils.degreesToRadians(angle),
      vec3.fromValues(1, 0, 0)
    );
    mat4.multiply(
      this.viewProjectionMatrix,
      this.projectionMatrix,
      this.viewMatrix
    );
  }

  updatePosition(x: number, y: number, z: number) {
    this.position[0] = x;
    this.position[1] = y;
    this.position[2] = z;
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

  getViewMatrix() {
    return this.viewMatrix;
  }

  getProjectionMatrix() {
    return this.projectionMatrix;
  }
}
