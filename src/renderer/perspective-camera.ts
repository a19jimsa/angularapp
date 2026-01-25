import { mat4, vec3 } from 'gl-matrix';
import { MathUtils } from 'src/Utils/MathUtils';

export class PerspectiveCamera {
  private projectionMatrix: mat4 = mat4.create();
  private viewMatrix: mat4 = mat4.create();
  private viewProjectionMatrix: mat4 = mat4.create();
  private cameraPos: vec3 = vec3.fromValues(500, 100, 1000);
  private cameraFront: vec3 = vec3.fromValues(0, 0, -1);
  private cameraUp: vec3 = vec3.fromValues(0, 1, 0);
  private rotation: number = 0;
  private yaw: number = -90;
  private pitch: number = 0;
  constructor(width: number, height: number) {
    mat4.perspective(
      this.projectionMatrix,
      MathUtils.degreesToRadians(45),
      width / height,
      1,
      10000
    );
    const target = vec3.create();
    vec3.add(target, this.cameraPos, this.cameraFront);
    mat4.lookAt(this.viewMatrix, this.cameraPos, target, this.cameraUp);
    mat4.multiply(
      this.viewProjectionMatrix,
      this.projectionMatrix,
      this.viewMatrix
    );
    console.log('Skapade kamera');
  }

  get Position() {
    return this.cameraPos;
  }

  set SetPosition(position: vec3) {
    this.cameraPos[0] = position[0];
    this.cameraPos[1] = position[1];
    this.cameraPos[2] = position[2];
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

    this.cameraFront = [
      this.cameraPos[0] + dirX,
      this.cameraPos[1] + dirY,
      this.cameraPos[2] + dirZ,
    ];
    mat4.lookAt(
      this.viewMatrix,
      this.cameraPos,
      this.cameraFront,
      vec3.fromValues(0, 1, 0)
    );
    mat4.multiply(
      this.viewProjectionMatrix,
      this.projectionMatrix,
      this.viewMatrix
    );
  }

  rotate(xSpeed: number, ySpeed: number) {
    this.yaw += xSpeed;
    this.pitch += ySpeed;

    // Begränsa pitch så kameran inte flipper
    if (this.pitch > 89.0) this.pitch = 89.0;
    if (this.pitch < -89.0) this.pitch = -89.0;
    const front = vec3.create();
    front[0] =
      Math.cos(MathUtils.degreesToRadians(this.yaw)) *
      Math.cos(MathUtils.degreesToRadians(this.pitch));
    front[1] = Math.sin(MathUtils.degreesToRadians(this.pitch));
    front[2] =
      Math.sin(MathUtils.degreesToRadians(this.yaw)) *
      Math.cos(MathUtils.degreesToRadians(this.pitch));
    this.cameraFront = vec3.normalize(this.cameraFront, front);
    this.updateCamera();
  }

  updatePosition(speedX: number, speedY: number, speedZ: number) {
    const cameraSpeed = vec3.create();
    vec3.scale(cameraSpeed, this.cameraFront, speedZ);
    vec3.add(this.cameraPos, this.cameraPos, cameraSpeed);

    const cross = vec3.create();
    vec3.cross(cross, this.cameraFront, this.cameraUp);
    vec3.normalize(cross, cross);
    vec3.scale(cross, cross, speedX);
    vec3.add(this.cameraPos, this.cameraPos, cross);

    const upMove = vec3.create();
    vec3.scale(upMove, this.cameraUp, speedY);
    vec3.add(this.cameraPos, this.cameraPos, upMove);
    this.updateCamera();
  }

  private updateCamera() {
    const target = vec3.create();

    vec3.add(target, this.cameraPos, this.cameraFront);
    mat4.lookAt(this.viewMatrix, this.cameraPos, target, this.cameraUp);
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

  resetCamera() {
    this.cameraPos = vec3.fromValues(500, 0, 1000);
    this.cameraFront = vec3.fromValues(0, 0, -1);
    this.cameraUp = vec3.fromValues(0, 1, 0);
    this.yaw = -90;
    this.pitch = 0;
    this.updateCamera();
  }
}
