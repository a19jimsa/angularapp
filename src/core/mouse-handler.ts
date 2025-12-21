import { ElementRef } from '@angular/core';
import { mat4, vec2, vec3, vec4 } from 'gl-matrix';
import { PerspectiveCamera } from 'src/renderer/perspective-camera';

export class MouseHandler {
  private canvas: HTMLCanvasElement;
  private camera: PerspectiveCamera;
  public lastX = 0;
  public lastY = 0;
  public previousX = 0;
  public previousY = 0;
  private deltaX = 0;
  private deltaY = 0;

  private isMoving: boolean = false;
  private isDragging: boolean = false;
  private isMouseDown: boolean = false;
  private isMouseMoved: boolean = false;
  private isClicked: boolean = false;
  private isReleased: boolean = false;
  private mousePosition = vec3.fromValues(0, 0, 0);
  private direction = vec3.fromValues(0, 0, 0);

  constructor(canvas: HTMLCanvasElement, camera: PerspectiveCamera) {
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
    vec3.scaleAndAdd(end, start, this.mousePosition, 500);

    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseenter', this.onMouseEnter.bind(this));
    this.canvas.addEventListener('mouseleave', this.onMouseLeave.bind(this));
    this.canvas.addEventListener('mousedown', this.onMousePressed.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseReleased.bind(this));
    this.canvas.addEventListener('click', this.onMouseClick.bind(this));
  }

  get getIsMouseDown() {
    return this.isMouseDown;
  }

  get getMousePosition() {
    return this.mousePosition;
  }

  get getDragging() {
    return this.isDragging;
  }

  get getDeltaX() {
    return this.deltaX;
  }

  get getDeltaY() {
    return this.deltaY;
  }

  get clicked() {
    return this.isClicked;
  }

  get mouseDirection() {
    return this.direction;
  }

  get moving() {
    return this.isMoving;
  }

  get released() {
    return this.isReleased;
  }

  private onMouseClick(e: MouseEvent) {
    this.isClicked = true;
    console.log('Mouse clicked');
  }

  private onMouseEnter(e: MouseEvent) {
    this.isMouseDown = false;
    this.isMouseMoved = false;
    console.log('Mouse enter canvas');
  }

  private onMouseMove(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.x - rect.left;
    const y = e.y - rect.top;
    this.mousePosition[0] = x;
    this.mousePosition[1] = y;
  }

  private onMouseLeave(e: MouseEvent) {
    console.log('Mouse leaved canvas');
    this.isDragging = false;
    this.isMouseDown = false;
    this.isMoving = false;
  }

  private onMousePressed(e: MouseEvent) {
    console.log('Mouse is pressed');
    this.isMouseDown = true;
    this.isReleased = false;
  }

  private onMouseReleased(e: MouseEvent) {
    console.log('Mouse press is released');
    this.isMouseDown = false;
    this.isReleased = true;
  }

  //Calculate RayCast from mousePosition of canvas
  //Return mouseRay vector 3
  public calculateRayCast() {
    const rect = this.canvas.getBoundingClientRect();
    const x = this.mousePosition[0];
    const y = this.mousePosition[1];
    //Between local space -1 - +1
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
