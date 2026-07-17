import { Command } from './command';

export type SplatBrush = {
  index: number;
  colorR: number;
  colorG: number;
  colorB: number;
  colorA: number;
};

export class SplatBrushCommand extends Command {
  private colors: SplatBrush[] = [];
  private colorsBefore: SplatBrush[] = [];
  private coords: Uint8ClampedArray;
  constructor(coords: Uint8ClampedArray, colors: SplatBrush[]) {
    super();
    this.coords = coords;
    this.colors = colors;
  }
  override execute(): void {
    for (const color of this.colors) {
      this.colorsBefore.push({
        index: color.index,
        colorR: this.coords[color.index + 0],
        colorG: this.coords[color.index + 1],
        colorB: this.coords[color.index + 2],
        colorA: this.coords[color.index + 3],
      });
      this.coords[color.index + 0] = color.colorR;
      this.coords[color.index + 1] = color.colorG;
      this.coords[color.index + 2] = color.colorB;
      this.coords[color.index + 3] = color.colorA;
    }
  }
  override undo(): void {
    for (const color of this.colorsBefore) {
      this.coords[color.index + 0] = color.colorR;
      this.coords[color.index + 1] = color.colorG;
      this.coords[color.index + 2] = color.colorB;
      this.coords[color.index + 3] = color.colorA;
    }
  }
}
