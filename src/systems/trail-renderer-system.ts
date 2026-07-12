import { vec3 } from 'gl-matrix';
import { TrailRenderer } from 'src/components/trail-renderer';
import { Transform3D } from 'src/components/transform3D';
import { Ecs } from 'src/core/ecs';
import { Model } from 'src/renderer/model';
import { MeshManager } from 'src/resource-manager/mesh-manager';

export class TrailRendererSystem {
  update(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const transform = ecs.getComponent<Transform3D>(entity, 'Transform3D');
      const trail = ecs.getComponent<TrailRenderer>(entity, 'TrailRenderer');
      if (!trail || !transform) return;
      const distance = vec3.distance(transform.position, trail.lastPosition);
      if (distance > trail.minVertexDistance) {
        trail.vertices.push(
          transform.position[0],
          transform.position[1],
          transform.position[2],
        );
        trail.vertices.push(
          transform.position[0] + trail.width,
          transform.position[1] + trail.width,
          transform.position[2] + trail.width,
        );
        const mesh = MeshManager.getMesh(trail.meshId);
        if (mesh) {
          mesh.vertexBuffer.vertices.set(trail.vertices);
        }
        vec3.copy(trail.lastPosition, transform.position);
      }
    }
  }
  removeTrailPoint(trail: number[]) {
    trail.splice(0, 3);
  }
}
