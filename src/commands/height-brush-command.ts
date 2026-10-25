import { Entity } from 'src/app/entity';
import { Command } from './command';
import { Ecs } from 'src/core/ecs';
import { Mesh } from 'src/components/mesh';
import { MeshManager } from 'src/resource-manager/mesh-manager';
import { Terrain } from 'src/components/terrain';
import { MeshRenderer } from 'src/components/mesh-renderer';

export class HeightBrushCommand extends Command {
  private entity: Entity;
  private ecs: Ecs;
  private heights: Map<number, number>;
  private heightBefore: Map<number, number> = new Map();
  constructor(entity: Entity, ecs: Ecs, heights: Map<number, number>) {
    super();
    this.entity = entity;
    this.ecs = ecs;
    this.heights = heights;
  }

  override execute(): void {
    const terrain = this.ecs.getComponent<Terrain>(this.entity, 'Terrain');
    const meshRenderer = this.ecs.getComponent<MeshRenderer>(
      this.entity,
      'MeshRenderer',
    );
    if (!meshRenderer || !terrain) return;
    const mesh = MeshManager.getMesh(meshRenderer.meshId);
    if (!mesh) throw new Error('Could not get mesh' + meshRenderer.meshId);
    const vertices = mesh.vertexBuffer.vertices;
    for (const height of this.heights) {
      this.heightBefore.set(height[0], height[1]);
      //Add one otherwise changes x
      vertices[height[0]] += height[1];
    }
    meshRenderer.dirty = true;
  }

  override undo(): void {
    const terrain = this.ecs.getComponent<Terrain>(this.entity, 'Terrain');
    const meshRenderer = this.ecs.getComponent<MeshRenderer>(
      this.entity,
      'MeshRenderer',
    );
    if (!terrain || !meshRenderer) return;
    //Init vertices
    const mesh = MeshManager.getMesh(meshRenderer.meshId);
    if (!mesh) throw new Error('Could not get mesh' + meshRenderer.meshId);
    let vertices = mesh.vertexBuffer.vertices;
    for (const height of this.heightBefore) {
      this.heightBefore.set(height[0], height[1]);
      //Add one otherwise changes x
      vertices[height[0]] -= height[1];
    }
    meshRenderer.dirty = true;
  }
}
