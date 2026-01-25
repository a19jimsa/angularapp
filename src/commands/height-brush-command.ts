import { Entity } from 'src/app/entity';
import { Command } from './command';
import { Ecs } from 'src/core/ecs';
import { Height } from 'src/systems/brush-system';
import { Mesh } from 'src/components/mesh';
import { MeshManager } from 'src/resource-manager/mesh-manager';

export class HeightBrushCommand extends Command {
  private entity: Entity;
  private ecs: Ecs;
  private heights: Height[] = [];
  private heightBefore: Height[] = [];
  constructor(entity: Entity, ecs: Ecs, heights: Height[]) {
    super();
    this.entity = entity;
    this.ecs = ecs;
    this.heights = heights;
  }

  override execute(): void {
    const mesh = this.ecs.getComponent<Mesh>(this.entity, 'Mesh');
    if (!mesh) return;
    for (const height of this.heights) {
      this.heightBefore.push(height);
      //Add influence to vertice on specific position
      mesh.vertices[height.index] += height.y;
    }
    const vao = MeshManager.getMesh(mesh.meshId);
    if (!vao) return;
    vao.vertexBuffer.vertices = new Float32Array(mesh.vertices);
    mesh.dirty = true;
  }

  override undo(): void {
    const mesh = this.ecs.getComponent<Mesh>(this.entity, 'Mesh');
    if (!mesh) return;
    for (const height of this.heightBefore) {
      //Substract influence to vertice on specific position
      mesh.vertices[height.index] -= height.y;
    }
    const vao = MeshManager.getMesh(mesh.meshId);
    if (!vao) return;
    vao.vertexBuffer.vertices = new Float32Array(mesh.vertices);
    mesh.dirty = true;
  }
}
