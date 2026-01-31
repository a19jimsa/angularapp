import { Entity } from 'src/app/entity';
import { Command } from './command';
import { Ecs } from 'src/core/ecs';
import { Grass } from 'src/components/grass';

export type GrassBrush = {
  index: number;
  x: number;
  y: number;
  z: number;
};

export class GrassBrushCommand extends Command {
  private entity: Entity;
  private ecs: Ecs;
  private positions: GrassBrush[] = [];
  constructor(entity: Entity, ecs: Ecs, positions: GrassBrush[]) {
    super();
    this.entity = entity;
    this.ecs = ecs;
    this.positions = positions;
  }
  override execute(): void {
    const grass = this.ecs.getComponent<Grass>(this.entity, 'Grass');
    if (!grass) return;
    for (const position of this.positions) {
      grass.positions[position.index + 0] = position.x;
      grass.positions[position.index + 1] = position.y;
      grass.positions[position.index + 2] = position.z;
    }
  }

  override undo(): void {
    const grass = this.ecs.getComponent<Grass>(this.entity, 'Grass');
    if (!grass) return;
    for (const position of this.positions) {
      grass.positions[position.index + 0] = 0;
      grass.positions[position.index + 1] = 0;
      grass.positions[position.index + 2] = 0;
      grass.index -= 3;
      grass.amount--;
    }
  }
}
