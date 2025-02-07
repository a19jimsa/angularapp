import { ElementRef } from '@angular/core';
import { Vec } from './vec';

export class MouseHandler {
  canvas: ElementRef<HTMLCanvasElement>;
  isMouseUp: boolean = false;
  isMouseDown: boolean = false;
  isDownPosition: Vec = new Vec(0, 0);
  isUpPosition: Vec = new Vec(0, 0);
  scrollValue: number = 0;
  position: Vec = new Vec(0, 0);
  rect: DOMRect;
  constructor(canvas: ElementRef<HTMLCanvasElement>) {
    this.canvas = canvas;
    this.rect = this.canvas.nativeElement.getBoundingClientRect();

    this.canvas.nativeElement.addEventListener(
      'mousedown',
      this.handleMouseDown.bind(this)
    );
    this.canvas.nativeElement.addEventListener(
      'mouseup',
      this.handleMouseUp.bind(this)
    );
    this.canvas.nativeElement.addEventListener(
      'wheel',
      this.handleScrollMovement.bind(this)
    );
    this.canvas.nativeElement.addEventListener(
      'mousemove',
      this.handleMove.bind(this)
    );
    console.log('Created mousehandler');
  }

  handleMove(event: MouseEvent) {
    this.rect = this.canvas.nativeElement.getBoundingClientRect();
    this.position.X =
      event.x - this.rect.left - this.canvas.nativeElement.clientLeft;
    this.position.Y =
      event.y - this.rect.top - this.canvas.nativeElement.clientTop;
  }

  handleScrollMovement(event: WheelEvent) {
    this.scrollValue += event.deltaY / 100;
    console.log(this.scrollValue);
  }

  handleMouseUp(event: MouseEvent) {
    this.isMouseDown = false;
    this.isMouseUp = true;
    this.isUpPosition.X = event.x - this.rect.left;
    this.isUpPosition.Y = event.y - this.rect.top;
  }

  handleMouseDown(event: MouseEvent) {
    this.isMouseDown = true;
    this.isMouseUp = false;
    this.isDownPosition.X = event.x - this.rect.left;
    this.isDownPosition.Y = event.y - this.rect.top;
  }
}
