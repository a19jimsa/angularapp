import { mat4, vec3 } from 'gl-matrix';
import { MathUtils } from 'src/Utils/MathUtils';

export class PerspectiveCamera {
  private projectionMatrix: mat4 = mat4.create();
  private viewMatrix: mat4 = mat4.create();
  private viewProjectionMatrix: mat4 = mat4.create();
  private position: vec3 = vec3.fromValues(0, 5, 1000);
  private rotation: number = 0;
  private target: vec3 = vec3.fromValues(
    this.position[0],
    this.position[1],
    this.position[2] - 100
  );

  constructor(width: number, height: number) {
    mat4.perspective(
      this.projectionMatrix,
      MathUtils.degreesToRadians(40),
      width / height,
      1,
      5000
    );
    mat4.lookAt(
      this.viewMatrix,
      this.position,
      this.target,
      vec3.fromValues(0, 1, 0)
    );
    mat4.multiply(
      this.viewProjectionMatrix,
      this.projectionMatrix,
      this.viewMatrix
    );
    console.log('Skapade kamera');
  }

  rotateZ(angle: number) {
    this.rotation += angle;

    mat4.rotateZ(
      this.viewMatrix,
      this.viewMatrix,
      MathUtils.degreesToRadians(this.rotation)
    );
    mat4.multiply(
      this.viewProjectionMatrix,
      this.projectionMatrix,
      this.viewMatrix
    );
  }

  rotateY(angle: number) {
    this.rotation += angle;
    mat4.rotateY(
      this.viewMatrix,
      this.viewMatrix,
      MathUtils.degreesToRadians(this.rotation)
    );
    mat4.multiply(
      this.viewProjectionMatrix,
      this.projectionMatrix,
      this.viewMatrix
    );
  }

  rotateX(angle: number) {
    this.rotation += angle;
    const targetAngleRadians = MathUtils.degreesToRadians(this.rotation);
    const dirX = 0;
    const dirY = Math.sin(targetAngleRadians) * 300;
    const dirZ = -Math.cos(targetAngleRadians) * 300;

    this.target = [
      this.position[0] + dirX,
      this.position[1] + dirY,
      this.position[2] + dirZ,
    ];
    mat4.lookAt(
      this.viewMatrix,
      this.position,
      this.target,
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

    this.target[0] += x;
    this.target[1] += y;
    this.target[2] += z;

    mat4.lookAt(
      this.viewMatrix,
      this.position,
      this.target,
      vec3.fromValues(0, 1, 0)
    );
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
