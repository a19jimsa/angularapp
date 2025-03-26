import { vec3, mat4, mat3 } from 'gl-matrix';

export class OrtographicCamera {
  projectionMatrix: mat4;
  viewMatrix: mat4;
  viewProjectionMatrix: mat4;
  position: vec3;
  rotation: number;

  constructor(left: number, right: number, top: number, bottom: number) {
    this.viewProjectionMatrix = mat4.create();
    mat4.identity(this.viewProjectionMatrix);
    this.projectionMatrix = mat4.create();
    mat4.identity(this.projectionMatrix);
    this.viewMatrix = mat4.create();
    mat4.identity(this.viewMatrix);
    mat4.multiply(
      this.viewProjectionMatrix,
      this.projectionMatrix,
      this.viewMatrix
    );
    mat4.ortho(this.projectionMatrix, left, right, bottom, top, -1.0, 1.0);
    this.position = vec3.fromValues(0, 0, 0);
    this.rotation = 0;
    this.recalculateViewMatrix();
  }

  getProjectionMatrix() {
    return this.projectionMatrix;
  }

  getViewMatrix() {
    return this.viewMatrix;
  }

  getProjectionViewMatrix() {
    return this.viewProjectionMatrix;
  }
  getPosition() {
    return this.position;
  }
  getRotation() {
    return this.rotation;
  }

  setPosition(x: number, y: number) {
    this.position = vec3.fromValues(x, y, 0);
    this.recalculateViewMatrix();
  }

  recalculateViewMatrix() {
    // Beräkna vy-matrisen med mat4.lookAt
    // mat4.lookAt tar en vy-matris, kamerans position, målpositionen och en uppåtriktning
    mat4.lookAt(
      this.viewMatrix,
      this.position,
      vec3.fromValues(-0.5, 0, 0.5),
      vec3.fromValues(-0.5, 0, 0.5)
    );

    // Beräkna vy-projektion-matrisen genom att multiplicera projektion-matrisen och vy-matrisen
    mat4.multiply(
      this.viewProjectionMatrix,
      this.projectionMatrix,
      this.viewMatrix
    );
  }
}
