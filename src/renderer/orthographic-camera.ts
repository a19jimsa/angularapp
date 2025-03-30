import { vec3, mat4, mat3, vec4 } from 'gl-matrix';

export class OrtographicCamera {
  private projectionMatrix: mat4 = mat4.create();
  private viewMatrix: mat4 = mat4.create();
  private viewProjectionMatrix: mat4 = mat4.create();
  private position: vec3;
  private rotation: number = 0;

  constructor(left: number, right: number, bottom: number, top: number) {
    this.position = vec3.fromValues(0, 0, 1);
    mat4.ortho(this.projectionMatrix, left, right, bottom, top, 0, 800);
    mat4.multiply(
      this.viewProjectionMatrix,
      this.projectionMatrix,
      this.viewMatrix
    );
  }

  recalculateViewMatrix() {
    const transform = mat4.create();
    this.viewMatrix = mat4.translate(transform, transform, this.position);
    mat4.invert(this.viewMatrix, this.viewMatrix);
    //This is the correct order
    mat4.multiply(
      this.viewProjectionMatrix,
      this.projectionMatrix,
      this.viewMatrix
    );
  }

  getProjectionMatrix() {
    return this.projectionMatrix;
  }

  getViewMatrix() {
    return this.viewMatrix;
  }

  getViewProjectionMatrix() {
    return this.viewProjectionMatrix;
  }
  getPosition() {
    return this.position;
  }
  getRotation() {
    return this.rotation;
  }

  setPosition(x: number, y: number) {
    this.position[0] += x;
    this.position[1] += y;
  }
}
