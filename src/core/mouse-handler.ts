import { ElementRef } from '@angular/core';
import { mat4, vec2, vec3, vec4 } from 'gl-matrix';
import { PerspectiveCamera } from 'src/renderer/perspective-camera';

export class MouseHandler {
  private canvas: ElementRef<HTMLCanvasElement>;
  private camera: PerspectiveCamera;
  public isMouseDown: boolean = true;
  public isMouseMoved: boolean = false;
  private mousePosition = vec3.fromValues(0, 0, 0);
  constructor(
    canvas: ElementRef<HTMLCanvasElement>,
    camera: PerspectiveCamera
  ) {
    this.canvas = canvas;
    this.camera = camera;
    // Kamera-position
    const viewMatrix = this.camera.getViewMatrix();
    const invertedView = mat4.create();
    mat4.invert(invertedView, viewMatrix);
    const origin = vec3.fromValues(
      invertedView[12],
      invertedView[13],
      invertedView[14]
    );

    // Musposition
    const start = origin;
    const end = vec3.create();
    vec3.scaleAndAdd(end, start, this.position, 500);

    this.canvas.nativeElement.addEventListener(
      'mousemove',
      this.onMouseMove.bind(this)
    );
    this.canvas.nativeElement.addEventListener(
      'mouseleave',
      this.onMouseOut.bind(this)
    );
    this.canvas.nativeElement.addEventListener(
      'mousedown',
      this.onMousePressed.bind(this)
    );
    this.canvas.nativeElement.addEventListener(
      'mouseup',
      this.onMouseReleased.bind(this)
    );
    this.canvas.nativeElement.addEventListener(
      'drag',
      this.onMouseDrag.bind(this)
    );
  }

  get position(): vec3 {
    return this.mousePosition;
  }

  onMouseDrag(e: MouseEvent) {
    if (this.isMouseDown) {
    }
  }

  onMouseOut(e: MouseEvent) {
    this.isMouseDown = false;
  }

  onMouseMove(e: MouseEvent) {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const x = e.x - rect.left;
    const y = e.y - rect.top;
    this.position[0] = x;
    this.position[1] = y;
  }

  onMouseLeave(e: MouseEvent) {
    this.isMouseDown = true;
  }

  onMousePressed(e: MouseEvent) {
    this.isMouseDown = true;
  }

  onMouseReleased(e: MouseEvent) {
    this.isMouseDown = false;
  }

  //Calculate RayCast from mousePosition of canvas
  //Return mouseRay vector 3
  calculateRayCast() {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const x = this.position[0];
    const y = this.position[1];
    const clipX = (x / rect.width) * 2 - 1;
    const clipY = (y / rect.height) * -2 + 1;
    const normalizedPos = vec2.fromValues(clipX, clipY);
    const clipCoords = vec4.fromValues(
      normalizedPos[0],
      normalizedPos[1],
      -1,
      1
    );
    const invertedProjectionMatrix = mat4.create();
    mat4.invert(invertedProjectionMatrix, this.camera.getProjectionMatrix());
    const eyeCoords = vec4.fromValues(0, 0, 0, 0);
    vec4.transformMat4(eyeCoords, clipCoords, invertedProjectionMatrix);
    const toEyeCoords = vec4.fromValues(eyeCoords[0], eyeCoords[1], -1, 0);
    const invertedView = mat4.create();
    mat4.invert(invertedView, this.camera.getViewMatrix());
    const rayWorld = vec4.fromValues(0, 0, 0, 0);
    vec4.transformMat4(rayWorld, toEyeCoords, invertedView);
    const mouseRay = vec3.fromValues(rayWorld[0], rayWorld[1], rayWorld[2]);
    vec3.normalize(mouseRay, mouseRay);
    return mouseRay;
  }
}
