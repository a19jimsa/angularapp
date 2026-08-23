import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Input,
  ViewChild,
} from '@angular/core';
import { CdkDrag, CdkDragEnd } from '@angular/cdk/drag-drop';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Texture } from 'src/renderer/texture';
import { GradientService } from '../map-editor/services/gradient.service';

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
  @Input() name: string = new Input();
  @Input() texture: Texture = new Input();
  @ViewChild('canvas')
  canvas!: ElementRef<HTMLCanvasElement>;
  ctx!: CanvasRenderingContext2D;
  gradient = new Uint8ClampedArray(1 * 256);
  colorStops: ColorStop[] = new Array();
  position: Position = { x: 0, y: 0 };
  color = new FormControl('');

  constructor(
    private cdr: ChangeDetectorRef,
    private service: GradientService,
  ) {}

  ngAfterViewInit() {
    this.load();
    this.updateCanvasFromTexture();
  }

  ngOnChange() {
    this.updateCanvasFromTexture();
  }

  load() {
    this.colorStops.push(
      { color: 'white', stop: 0, position: this.position },
      { color: 'white', stop: 1, position: this.position },
    );
  }

  save() {
    this.service.gradients.set(this.name, this.gradient);
  }

  updateCanvasFromTexture() {
    const canvas = this.canvas.nativeElement;

    canvas.width = 256;
    canvas.height = 1;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, 256, 1);
    const gradients = ctx.createLinearGradient(0, 0, 256, 1);
    gradients.addColorStop(0, 'white');
    gradients.addColorStop(1, 'white');
    const gradient = this.texture.ImageData as Uint8ClampedArray;
    for (let x = 0; x < 256; x++) {
      const i = x * 4;
      imageData.data[i] = gradient[i];
      imageData.data[i + 1] = gradient[i + 1];
      imageData.data[i + 2] = gradient[i + 2];
      imageData.data[i + 3] = gradient[i + 3];
    }
    ctx.putImageData(imageData, 0, 0);
  }

  updateTextureFromCanvas() {
    const canvas = this.canvas.nativeElement;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gradients = ctx.createLinearGradient(0, 0, 256, 0);

    for (const colorstop of this.colorStops) {
      gradients.addColorStop(colorstop.stop, colorstop.color);
    }

    ctx.fillStyle = gradients;
    ctx.fillRect(0, 0, 256, 1);

    const imageData = ctx.getImageData(0, 0, 256, 1);

    const gradient = this.texture.ImageData as Uint8ClampedArray;

    gradient.set(imageData.data);

    this.updateTexture();
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
    this.updateTextureFromCanvas();
  }

  updateTexture() {
    console.log(this.texture.ImageData);
    this.texture.updateTexture(this.texture.ImageData as Uint8ClampedArray);
    this.cdr.detectChanges();
  }
}
