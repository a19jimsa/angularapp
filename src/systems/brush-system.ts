import { mat4, vec3 } from 'gl-matrix';
import { Mesh } from 'src/components/mesh';
import { Ecs } from 'src/core/ecs';
import { PerspectiveCamera } from 'src/renderer/perspective-camera';

export class BrushSystem {
  update(ecs: Ecs, mousePos: vec3, perspectiveCamera: PerspectiveCamera) {
    for (const entity of ecs.getEntities()) {
      const mesh = ecs.getComponent<Mesh>(entity, 'Mesh');
      if (mesh) {
        this.pickVertex(mesh.vertices, mousePos, perspectiveCamera);
      }
    }
  }

  private pickVertex(
    vertices: Float32Array,
    mousePos: vec3,
    perspectiveCamera: PerspectiveCamera
  ) {
    const epsilon = 1;
    const maxDistance = 100;
    const step = 1;

    const viewMatrix = perspectiveCamera.getViewMatrix();
    const invertedView = mat4.create();
    mat4.invert(invertedView, viewMatrix);

    const rayOrigin = vec3.fromValues(
      invertedView[12],
      invertedView[13],
      invertedView[14]
    );

    for (let t = 0; t < maxDistance; t += step) {
      const pos = vec3.create();
      vec3.scaleAndAdd(pos, rayOrigin, mousePos, t); // pos = origin + dir * t
      for (let i = 0; i < vertices.length; i += 8) {
        const vx = vertices[i];
        const vy = vertices[i + 1];
        const vz = vertices[i + 2];
        // Beräkna distans från rayens aktuella punkt till vertexen
        const dx = vx - pos[0];
        const dy = vy - pos[1];
        const dz = vz - pos[2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Om vi är nära nog en vertex (dist < threshold), skriv ut träffen
        if (dist < epsilon) {
          //alert(`Träff på vertex vid: (${vx}, ${vy}, ${vz})`);
          this.meshBrush(vertices, vx, vy, vz);
          //this.backgroundMesh.updateNormals();
          return; // Om du vill stoppa när du hittar första träffen
        }
      }
    }
    return null;
  }

  private meshBrush(vertices: Float32Array, x: number, y: number, z: number) {
    const brushRadius = 5;
    const brushStrength = 1;
    for (let i = 0; i < vertices.length; i += 8) {
      const vx = vertices[i];
      const vz = vertices[i + 2];
      // Beräkna distans från rayens aktuella punkt till vertexen
      const dx = vx - x;
      const dz = vz - z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      // Om vi är nära nog en vertex (dist < threshold), skriv ut träffen
      if (dist < brushRadius) {
        const influence = 1 - dist / brushRadius;
        vertices[i + 1] += influence * brushStrength;
      }
    }
    console.log(vertices);
  }
}
