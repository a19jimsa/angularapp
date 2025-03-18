import { MouseHandler } from 'src/app/mouse-handler';
import { Inventory } from 'src/components/inventory';
import { Sprite } from 'src/components/sprite';
import { Transform } from 'src/components/transform';
import { Ecs } from 'src/core/ecs';

export class InventorySystem {
  update(ecs: Ecs, mouseHandler: MouseHandler) {
    const pool = ecs.getPool<[Inventory]>('Inventory');
    pool.forEach(({ entity, components }) => {
      const [inventory] = components;
      for (const otherEntity of ecs.getEntities()) {
        if (inventory.items.has(otherEntity)) {
          ecs.removeEntity(otherEntity);
        }
      }
    });
  }

  private isMouseOverSprite(
    transform: Transform,
    sprite: Sprite,
    mouseHandler: MouseHandler
  ): boolean {
    const mousex = mouseHandler.position.x;
    const mousey = mouseHandler.position.y;
    return (
      mousex > transform.position.x &&
      mousex < sprite.image.width &&
      mousey > transform.position.y &&
      mousey < sprite.image.height
    );
  }
}
