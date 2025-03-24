import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Renderer } from 'src/renderer/renderer';

@Component({
  selector: 'app-map-editor',
  imports: [],
  templateUrl: './map-editor.component.html',
  styleUrl: './map-editor.component.css',
})
export class MapEditorComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;
  ctx!: WebGL2RenderingContext;
  width: number = 0;
  height: number = 0;
  renderer: Renderer;
  constructor() {
    this.renderer = new Renderer();
  }

  ngAfterViewInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('webgl2')!;
    this.width = this.canvas.nativeElement.width;
    this.height = this.canvas.nativeElement.height;
    this.renderer.drawTriangle(this.ctx);
  }
}
