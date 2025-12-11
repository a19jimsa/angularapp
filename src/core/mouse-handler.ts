import { ElementRef } from '@angular/core';
import { mat4, vec2, vec3, vec4 } from 'gl-matrix';
import { PerspectiveCamera } from 'src/renderer/perspective-camera';

type IsSelected = {
  select: boolean;
  element: number;
};

export class MouseHandler {
  private canvas: ElementRef<HTMLCanvasElement>;
  private camera: PerspectiveCamera;
  private lastX = 0;
  private lastY = 0;
  private deltaX = 0;
  private deltaY = 0;
  private dragX = 0;
  private dragY = 0;
  public isSelected: IsSelected = { select: false, element: -1 };
  private isDragging: boolean = false;
  private isMouseDown: boolean = false;
  private isMouseMoved: boolean = false;
  private isClicked: boolean = false;
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
    vec3.scaleAndAdd(end, start, this.mousePosition, 500);

    this.canvas.nativeElement.addEventListener(
      'mousemove',
      this.onMouseMove.bind(this)
    );
    this.canvas.nativeElement.addEventListener(
      'mouseenter',
      this.onMouseEnter.bind(this)
    );
    this.canvas.nativeElement.addEventListener(
      'mouseleave',
      this.onMouseLeave.bind(this)
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
      'click',
      this.onMouseClick.bind(this)
    );
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

  private onMouseClick(e: MouseEvent) {
    this.isClicked = true;
  }

  private onMouseEnter(e: MouseEvent) {
    this.isMouseDown = false;
    this.isMouseMoved = false;
  }

  private onMouseMove(e: MouseEvent) {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const x = e.x - rect.left;
    const y = e.y - rect.top;
    this.mousePosition[0] = x;
    this.mousePosition[1] = y;
    if (this.isMouseDown) {
      this.deltaX = x - this.lastX;
      this.deltaY = y - this.lastY;
      this.lastX = x;
      this.lastY = y;
      this.isDragging = true;
    }
  }

  private onMouseLeave(e: MouseEvent) {
    this.isMouseDown = false;
    this.isDragging = false;
    this.isSelected = { select: false, element: -1 };
  }

  private onMousePressed(e: MouseEvent) {
    if (this.isMouseDown) return;
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const x = e.x - rect.left;
    const y = e.y - rect.top;
    this.mousePosition[0] = x;
    this.mousePosition[1] = y;
    this.lastX = x;
    this.lastY = y;
    this.deltaX = 0;
    this.deltaY = 0;
    this.isMouseDown = true;
  }

  private onMouseReleased(e: MouseEvent) {
    this.isMouseDown = false;
    this.isDragging = false;
    this.isClicked = false;
    this.isSelected = { select: false, element: -1 };
  }

  //Calculate RayCast from mousePosition of canvas
  //Return mouseRay vector 3
  calculateRayCast() {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const x = this.mousePosition[0];
    const y = this.mousePosition[1];
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
    this.mousePosition[0] = mouseRay[0];
    this.mousePosition[1] = mouseRay[1];
    this.mousePosition[2] = mouseRay[2];
  }
}
