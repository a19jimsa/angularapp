import { Mouse } from 'src/app/map-editor/map-editor.component';
import { Pivot } from 'src/components/pivot';
import { Transform3D } from 'src/components/transform3D';
import { Ecs } from 'src/core/ecs';
import { MeshManager } from 'src/resource-manager/mesh-manager';
import { MathUtils } from 'src/Utils/MathUtils';

export class EditorMoveSystem {
  update(ecs: Ecs, mouse: Mouse) {
    const pool = ecs.getPool<[Transform3D, Pivot]>('Transform3D', 'Pivot');
    pool.forEach(({ entity, components }) => {
      const [transform, pivot] = components;
      const vertexArray = MeshManager.getMesh('pivot');
      if (!vertexArray) return;
      const vertex = MathUtils.pickVertexNew(transform, vertexArray, mouse);
      if (!vertex) return;
      console.log(vertex);
      this.movePivot(transform, mouse, 0);
    });
  }

  private movePivot(transform3D: Transform3D, mouse: Mouse, index: number) {
    if (mouse.isSelected.select && mouse.isSelected.element === 6) {
      transform3D.position[0] -= mouse.deltaX;
      return;
    } else if (mouse.isSelected.select && mouse.isSelected.element === 18) {
      transform3D.position[1] += mouse.deltaY;
      return;
    } else if (mouse.isSelected.select && mouse.isSelected.element === 30) {
      transform3D.position[2] -= mouse.deltaY;
      return;
    }
  }
}
