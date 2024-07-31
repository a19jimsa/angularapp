import { ElementRef } from '@angular/core';
import { Vec } from './vec';

export class MouseHandler {
  canvas: ElementRef<HTMLCanvasElement>;
  isMouseUp: boolean = false;
  isMouseDown: boolean = false;
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
      'mousemove',
      this.handleMouseMove.bind(this)
    );
    console.log('Created mousehandler');
  }

  getMousePosition() {
    return this.position;
  }

  handleMouseMove(event: MouseEvent) {
    this.position.X = event.x - this.rect.left;
    this.position.Y = event.y - this.rect.top;
    this.position = new Vec(event.x, event.y);
  }

  handleMouseUp(event: MouseEvent) {
    this.isMouseDown = false;
    this.isMouseUp = true;
    this.position.X = event.x - this.rect.left;
    this.position.Y = event.y - this.rect.top;
  }

  handleMouseDown(event: MouseEvent) {
    this.isMouseDown = true;
    this.isMouseUp = false;
    this.position.X = event.x - this.rect.left;
    this.position.Y = event.y - this.rect.top;
  }
}
