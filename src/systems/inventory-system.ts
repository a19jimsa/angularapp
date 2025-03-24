import { MouseHandler } from 'src/app/mouse-handler';
import { Vec } from 'src/app/vec';
import { Inventory } from 'src/components/inventory';
import { Item } from 'src/components/item';
import { Skeleton } from 'src/components/skeleton';
import { Sprite } from 'src/components/sprite';
import { Transform } from 'src/components/transform';
import { Ecs } from 'src/core/ecs';

export class InventorySystem {
  update(ecs: Ecs, mouseHandler: MouseHandler) {
    const pool = ecs.getPool<[Inventory]>('Inventory');
    pool.forEach(({ entity, components }) => {
      const [inventory] = components;
      const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
      for (const otherEntity of ecs.getEntities()) {
        //Add item component to convert to item if exist in world, and only if not held
        if (skeleton.heldEntity === otherEntity) continue;
        ecs.addComponent<Item>(otherEntity, new Item());
        if (inventory.items.has(otherEntity)) {
          ecs.removeEntity(otherEntity);
        }
      }
      //When every item is in inventory and not in world
      if (!inventory.show) return;
      let x = 100;
      let y = 100;
      for (const item of inventory.items) {
        const sprite = item[1].find((e) => e.type === 'Sprite');
        const isOver = item[1].find((e) => e.type === 'Item');
        if (sprite instanceof Sprite && isOver instanceof Item) {
          isOver.position.x = x;
          isOver.position.y = y;
          if (this.isMouseOverSprite(isOver.position, sprite, mouseHandler)) {
            if (mouseHandler.isMouseDown) {
              if (skeleton) {
                ecs.moveEntityToECS(item[0], item[1]);
                skeleton.heldEntity = item[0];
                inventory.show = false;
              }
            }
            isOver.isOver = true;
          } else {
            isOver.isOver = false;
          }
          x += sprite.clip.endX;
        }
      }
    });
  }

  private isMouseOverSprite(
    position: Vec,
    sprite: Sprite,
    mouseHandler: MouseHandler
  ): boolean {
    const mousex = mouseHandler.position.x;
    const mousey = mouseHandler.position.y;
    return (
      mousex > position.x &&
      mousex < position.x + sprite.clip.endX &&
      mousey > position.y &&
      mousey < position.y + sprite.clip.endY
    );
  }
}
