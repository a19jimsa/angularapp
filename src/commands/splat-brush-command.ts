import { Entity } from 'src/app/entity';
import { Command } from './command';
import { Ecs } from 'src/core/ecs';
import { Splatmap } from 'src/components/splatmap';

export type SplatBrush = {
  index: number;
  colorR: number;
  colorG: number;
  colorB: number;
  colorA: number;
};

export class SplatBrushCommand extends Command {
  private entity: Entity;
  private ecs: Ecs;
  private colors: SplatBrush[] = [];
  private colorsBefore: SplatBrush[] = [];
  constructor(entity: Entity, ecs: Ecs, colors: SplatBrush[]) {
    super();
    this.entity = entity;
    this.ecs = ecs;
    this.colors = colors;
  }
  override execute(): void {
    const splatmap = this.ecs.getComponent<Splatmap>(this.entity, 'Splatmap');
    if (!splatmap) return;
    for (const color of this.colors) {
      this.colorsBefore.push({
        index: color.index,
        colorR: splatmap.coords[color.index + 0],
        colorG: splatmap.coords[color.index + 1],
        colorB: splatmap.coords[color.index + 2],
        colorA: splatmap.coords[color.index + 3],
      });
      splatmap.coords[color.index + 0] = color.colorR;
      splatmap.coords[color.index + 1] = color.colorG;
      splatmap.coords[color.index + 2] = color.colorB;
      splatmap.coords[color.index + 3] = color.colorA;
    }
    splatmap.dirty = true;
  }
  override undo(): void {
    const splatmap = this.ecs.getComponent<Splatmap>(this.entity, 'Splatmap');
    if (!splatmap) return;
    for (const color of this.colorsBefore) {
      splatmap.coords[color.index + 0] = color.colorR;
      splatmap.coords[color.index + 1] = color.colorG;
      splatmap.coords[color.index + 2] = color.colorB;
      splatmap.coords[color.index + 3] = color.colorA;
    }
    splatmap.dirty = true;
  }
}
