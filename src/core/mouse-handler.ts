import { ElementRef } from '@angular/core';
import { mat4, vec2, vec3, vec4 } from 'gl-matrix';
import { PerspectiveCamera } from 'src/renderer/perspective-camera';

export class MouseHandler {
  private canvas: ElementRef<HTMLCanvasElement>;
  private camera: PerspectiveCamera;
  private timer: any;
  public lastX = 0;
  public lastY = 0;
  public previousX = 0;
  public previousY = 0;
  private deltaX = 0;
  private deltaY = 0;
  private dragX = 0;
  private dragY = 0;

  private isMoving: boolean = false;
  private isDragging: boolean = false;
  private isMouseDown: boolean = false;
  private isMouseMoved: boolean = false;
  private isClicked: boolean = false;
  private mousePosition = vec3.fromValues(0, 0, 0);
  private direction = vec3.fromValues(0, 0, 0);
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

  get mouseDirection() {
    return this.direction;
  }

  get moving() {
    return this.isMoving;
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
    const rect = this.canvas.nativeElement.getBoundingClientRect();
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
  }

  private onMouseReleased(e: MouseEvent) {
    console.log('Mouse press is released');
    this.isMouseDown = false;
  }
}
