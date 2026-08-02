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
    const loaded = this.load();
    if (!loaded) {
      this.addColorStop(0, 'white');
      this.addColorStop(1, 'white');
    }
    this.updateGradientFromTexture();
  }

  ngOnChange() {
    this.save();
  }

  load() {
    if (!this.name) throw new Error('Could not get name of ' + this.name);
    const colorStops = localStorage.getItem(
      this.name + this.texture.UniformName,
    );
    if (colorStops) {
      this.colorStops = JSON.parse(colorStops);
      return true;
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
    this.gradient = ctx.createLinearGradient(0, 0, 256, 1);

    for (let i = 0; i < this.colorStops.length; i++) {
      const colorStop = this.colorStops[i];
      this.gradient.addColorStop(Math.abs(colorStop.stop), colorStop.color);
    }

    ctx.fillStyle = this.gradient;
    ctx.fillRect(0, 0, 256, 1);
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
    this.cdr.detectChanges();
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
    this.updateTextureFromCanvas();
    this.updateTexture();
  }

  updateTexture() {
    const canvas = this.canvas.nativeElement;
    const ctx = canvas.getContext('2d')!;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    this.texture.updateTexture(imageData.data);
  }
}
