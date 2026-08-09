import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { CdkDrag, CdkDragEnd } from '@angular/cdk/drag-drop';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Texture } from 'src/renderer/texture';

type ColorStop = {
  color: string;
  stop: number;
  position: Position;
};

type Position = {
  x: number;
  y: number;
};

@Component({
  selector: 'app-gradient-creator',
  imports: [CdkDrag, ReactiveFormsModule, FormsModule],
  templateUrl: './gradient-creator.component.html',
  styleUrl: './gradient-creator.component.css',
})
export class GradientCreatorComponent {
  @Input() name: string | null = new Input();
  @Input() texture: Texture = new Input();
  @ViewChild('canvas')
  canvas!: ElementRef<HTMLCanvasElement>;
  ctx!: CanvasRenderingContext2D;
  gradient!: CanvasGradient;
  colorStops: ColorStop[] = new Array();
  position: Position = { x: 0, y: 0 };
  color = new FormControl('');

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.load();
    this.updateGradientFromTexture();
  }

  ngOnChange() {
    this.load();
    this.updateGradientFromTexture();
  }

  load() {
    if (!this.name) throw new Error('Could not get name of ' + this.name);
    const colorStops = localStorage.getItem(
      this.name + this.texture.UniformName,
    );
    if (colorStops) {
      this.colorStops = JSON.parse(colorStops);
      return true;
    } else {
      this.colorStops.push(
        { color: 'white', stop: 0, position: this.position },
        { color: 'white', stop: 1, position: this.position },
      );
    }
    return false;
  }

  save() {
    if (!this.name) throw new Error('Could not get name of ' + this.name);
    localStorage.setItem(
      this.name + this.texture.UniformName,
      JSON.stringify(this.colorStops),
    );
  }

  updateGradientFromTexture() {
    const canvas = this.canvas.nativeElement;

    canvas.width = 256;
    canvas.height = 1;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.gradient = ctx.createLinearGradient(0, 0, 255, 0);

    for (let i = 0; i < this.colorStops.length; i++) {
      const colorStop = this.colorStops[i];
      console.log(colorStop.color);
      this.gradient.addColorStop(Math.abs(colorStop.stop), colorStop.color);
    }

    ctx.fillStyle = this.gradient;
    ctx.fillRect(0, 0, 256, 1);
    this.updateTextureFromCanvas();
    this.updateTexture();
    this.save();
  }

  updateTextureFromCanvas() {
    const canvas = this.canvas.nativeElement;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, 256, 1);
    const gradient = this.texture.ImageData as Uint8ClampedArray;
    for (let x = 0; x < 256; x++) {
      const i = x * 4;
      gradient[i] = imageData.data[i];
      if (imageData.data[i] === 254) {
        gradient[i] = 255;
      }
      gradient[i + 1] = imageData.data[i + 1];
      gradient[i + 2] = imageData.data[i + 2];
      gradient[i + 3] = imageData.data[i + 3];
    }
  }

  addColorStop(time: number, color: string) {
    this.colorStops.push({
      color: color,
      stop: time,
      position: { x: time, y: 0 },
    });
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
    this.updateGradientFromTexture();
  }

  updateTexture() {
    console.log(this.texture.ImageData);
    this.texture.updateTexture(this.texture.ImageData as Uint8ClampedArray);
    this.cdr.detectChanges();
  }
}
