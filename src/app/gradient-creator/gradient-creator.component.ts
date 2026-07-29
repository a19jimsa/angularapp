import { Component, ElementRef, ViewChild } from '@angular/core';
import { CdkDrag, CdkDragEnd } from '@angular/cdk/drag-drop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TextureManager } from 'src/resource-manager/texture-manager';
import { SceneManager } from 'src/scene/scene-manager';
import { Target } from 'src/renderer/texture';

type ColorStop = {
  color: string;
  stop: number;
};

@Component({
  selector: 'app-gradient-creator',
  imports: [CdkDrag, ReactiveFormsModule],
  templateUrl: './gradient-creator.component.html',
  styleUrl: './gradient-creator.component.css',
})
export class GradientCreatorComponent {
  @ViewChild('canvas')
  canvas!: ElementRef<HTMLCanvasElement>;
  ctx!: CanvasRenderingContext2D;
  gradient!: CanvasGradient;
  colorStops: ColorStop[] = new Array();
  position = { x: 0, y: 0 };
  color = new FormControl('');

  ngAfterViewInit() {
    this.createCanvas();
    this.addColorStop(0, 'white');
    this.addColorStop(1, 'black');
  }

  createCanvas() {
    const canvas = this.canvas.nativeElement;

    canvas.width = 256;
    canvas.height = 1;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.gradient = ctx.createLinearGradient(0, 0, 256, 0);

    for (let i = 0; i < this.colorStops.length; i++) {
      const colorStop = this.colorStops[i];
      this.gradient.addColorStop(colorStop.stop, colorStop.color);
    }

    ctx.fillStyle = this.gradient;
    ctx.fillRect(0, 0, 256, 1);
  }

  addColorStop(time: number, color: string) {
    this.colorStops.push({ color: color, stop: time });
    this.createCanvas();
  }

  onDropped(event: CdkDragEnd, colorStop: ColorStop, color: string | null) {
    const x = event.source.getFreeDragPosition().x;
    const width = this.canvas.nativeElement.clientWidth;
    const position = x / width;
    console.log(position);
    colorStop.stop = position;
    if (color) {
      colorStop.color = color;
    }
    this.createCanvas();
  }

  async getGradientTexture() {
    const imageBlob = this.canvas.nativeElement.toDataURL('image/png');
    const image = new Image();
    image.src = imageBlob;
    const texture = await TextureManager.addTextureArray(
      'gradients',
      'u_gradients',
      [image],
      false,
    );
    return texture;
  }
}
