import { Render } from '../components/render';
import { Rotation } from '../components/rotation';
import { Transform } from '../components/transform';
import { Ecs } from '../core/ecs';
import { Renderer } from '../app/renderer';

export class RenderSystem {
  update(ecs: Ecs, renderer: Renderer) {
    for (const entity of ecs.getEntities()) {
      const render = ecs.getComponent<Render>(entity, 'Render');
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      const rotation = ecs.getComponent<Rotation>(entity, 'Rotation');
      let angle = 0;
      if (rotation !== undefined) {
        angle = rotation.angle;
      }
      if (render !== undefined && transform !== undefined) {
        renderer.render(
          transform.position,
          render.color,
          transform.radius,
          angle
        );
      }
    }
  }
}
