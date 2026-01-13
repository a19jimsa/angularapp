import { mat4, vec2, vec3, vec4 } from 'gl-matrix';

export class MouseHandler {
  private canvas: HTMLCanvasElement;
  public lastX = 0;
  public lastY = 0;
  public previousX = 0;
  public previousY = 0;
  private deltaX = 0;
  private deltaY = 0;
  private scrollDeltaY = 0;

  private wheelHasMoved: boolean = false;
  private isMoving: boolean = false;
  private isDragging: boolean = false;
  private isMouseDown: boolean = false;
  private isMouseMoved: boolean = false;
  private isClicked: boolean = false;
  private isReleased: boolean = false;
  private mousePosition = vec3.fromValues(0, 0, 0);
  private direction = vec3.fromValues(0, 0, 0);

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseenter', this.onMouseEnter.bind(this));
    this.canvas.addEventListener('mouseleave', this.onMouseLeave.bind(this));
    this.canvas.addEventListener('mousedown', this.onMousePressed.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseReleased.bind(this));
    this.canvas.addEventListener('click', this.onMouseClick.bind(this));
    this.canvas.addEventListener('wheel', this.onMouseScroll.bind(this));
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

  get scrollY() {
    return this.scrollDeltaY;
  }

  set scrollY(value: number) {
    this.scrollDeltaY = value;
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

  private onMouseScroll(event: WheelEvent) {
    console.log(event.deltaY);
    this.scrollDeltaY = event.deltaY;
  }
}
