import { Controlable } from '../components/controlable';
import { Render } from '../components/render';
import { Rotation } from '../components/rotation';
import { Transform } from '../components/transform';
import { Ecs } from '../ecs';
import { Renderer } from '../renderer';

export class RenderSystem {
  update(ecs: Ecs, renderer: Renderer) {
    for (let entity of ecs.getEntities()) {
      const render = ecs.getComponent<Render>(entity, 'Render');
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      const rotation = ecs.getComponent<Rotation>(entity, 'Rotation');
      const control = ecs.getComponent<Controlable>(entity, 'Controlable');
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
      if (control !== undefined) {
        renderer.drawSpeedControl(transform.position, control.velocity);
      }
    }
  }
}
